import { hereUtils } from '../../utils';
import { Accounts, Vendor } from "../../models";
import _ from 'lodash';
import { constants } from '../../configs';

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
        await Vendor.findOneAndUpdate({
          accountId: context.user.id
        }, {
          name,
          address,
          image,
          location: { type: 'Point', coordinates },
          timeOpen: constants.TIME_OPEN_DEFAULT
        });
      } else {
        await Vendor.create({
          accountId: context.user.id,
          name,
          address,
          image,
          phoneNumber: account.phoneNumber,
          location: { type: 'Point', coordinates },
          timeOpen: constants.TIME_OPEN_DEFAULT
        });
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
  },

  updateStatusReceiveOrder: async (parent, args, context, info) => {
    global.logger.info('vendorMutation::updateStatusReceiveOrder' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa là cửa hàng');
    }

    vendor = await Vendor.findOneAndUpdate({ _id: vendor._id }, { isReceiveOrder: !vendor.isReceiveOrder }, { new: true });

    return vendor.isReceiveOrder;
  },

  updateTimeOpen: async (parent, args, context, info) => {
    global.logger.info('vendorMutation::updateTimeOpen' + JSON.stringify(args));

    const newTimeOpen = args.timeOpen;

    // check login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa là cửa hàng');
    }

    // check valid time
    if (!constants.DAYS.includes(newTimeOpen.day)) {
      throw new Error('Thứ không hợp lệ');
    }

    if (newTimeOpen.openTime < 0 || newTimeOpen.openTime > 24) {
      throw new Error('Thời gian mở cửa không hợp lệ');
    }

    if (newTimeOpen.closeTime < 0 || newTimeOpen.closeTime > 24) {
      throw new Error('Thời gian đóng cửa không hợp lệ');
    }

    if (newTimeOpen.openTime >= newTimeOpen.closeTime) {
      throw new Error('Thời gian mở cửa phải nhỏ hơn thời gian đóng cửa');
    }

    let timeOpen = vendor.timeOpen;

    for (let i = 0; i < timeOpen.length; i++) {
      if (timeOpen[i].day === newTimeOpen.day) {
        timeOpen[i].openTime = newTimeOpen.openTime;
        timeOpen[i].closeTime = newTimeOpen.closeTime;
        timeOpen[i].isOpen = newTimeOpen.isOpen;
        break;
      }
    }

    vendor = await Vendor.findOneAndUpdate({ _id: vendor._id }, { timeOpen }, { new: true });

    return true;
  }
}


export default vendorMutation;