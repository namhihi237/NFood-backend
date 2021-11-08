import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper } from "../../models";
import _ from 'lodash';
import { hereUtils } from "../../utils";
import { add } from 'winston';

const vendorMutation = {
  activeVendor: async (parent, args, context, info) => {
    global.logger.info('vendorMutation.activeVendor', JSON.stringify(args));
    let { name, address, image } = args;
    try {
      // check login
      if (!context.user) {
        throw new Error('Vui lòng đăng nhập');
      }

      // check required fields
      if (!name || !address || !image) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }

      let account = await Accounts.findById(context.user.id);

      if (!account) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (account.isVendor) {
        throw new Error('Bạn đã có cửa hàng');
      }

      // convert address to latlng
      address = address.trim();
      const geocode = await hereUtils.getGeoLocation(address);
      let coordinates = null;
      if (geocode) {
        coordinates = [geocode.lng, geocode.lat];
      }

      let vendor = await Vendor.findOne({ accountId: account._id });
      if (vendor) {
        await Vendor.findOneAndUpdate({ accountId: context.user.id }, { name, address, image, location: { type: 'Point', coordinates } });
      } else {
        await Vendor.create({ accountId: context.user.id, name, address, image, location: { type: 'Point', coordinates } });
      }
      await Accounts.findByIdAndUpdate(context.user.id, { isVendor: true, });
      if (!account.role.includes('vendor')) {
        await Accounts.findByIdAndUpdate(context.user.id, { $push: { role: 'vendor' } });
      }

      return {
        success: true,
        message: 'Bạn đã mở cửa hàng thành công!'
      }

    } catch (error) {
      throw new Error(error);
    }
  }
}


export default vendorMutation;