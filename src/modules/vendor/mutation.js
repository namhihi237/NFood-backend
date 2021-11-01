import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper } from "../../models";

import _ from 'lodash';

const vendorMutation = {
  activeVendor: async (parent, args, context, info) => {
    global.logger.info('vendorMutation.activeVendor', JSON.stringify(args));
    const { name, address, image } = args;
    try {
      // check login
      console.log(context);
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

      let vendor = await Vendor.findOne({ accountId: account._id });
      if (vendor) {
        await Vendor.findOneAndUpdate({ accountId: context.user.id }, { name, address, image });
      } else {
        await Vendor.create({ accountId: context.user.id, name, address, image });
      }

      if (!account.role.includes('vendor')) {
        await Accounts.findByIdAndUpdate(context.user.id, { isVendor: true, $push: { role: 'vendor' } });
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