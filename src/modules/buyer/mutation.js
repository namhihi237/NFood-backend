import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, VendorFavorite, Buyer, Vendor, Shipper } from "../../models";

import _ from 'lodash';

const buyerMutation = {
  setNameBuyer: async (parent, args, context, info) => {
    global.logger.info('buyerMutation::setNameBuyer' + JSON.stringify(args));
    let { name } = args;

    // check has login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    // check required fields
    if (!name) {
      throw new Error('Nhập tên gọi của bạn');
    }

    // check has buyer
    let account = await Accounts.findById(context.user.id);

    if (account.isBuyer) {
      throw new Error('Bạn đã là người mua');
    }
    // update name buyer
    let buyer = await Buyer.findOne({ accountId: account._id });

    if (buyer) {
      await Buyer.updateOne({ _id: buyer._id }, { name });
    } else {
      await Buyer.create({ accountId: account._id, name, phoneNumber: account.phoneNumber });
    }

    if (!account.role.includes('buyer')) {
      await Accounts.findByIdAndUpdate(context.user.id, { isBuyer: true, $push: { role: 'buyer' } });
    }

    await Accounts.findByIdAndUpdate(context.user.id, { isBuyer: true });

    return {
      success: true,
      message: 'Bạn đã đăng ký thành công, tiến hành mua hàng thôi nào.'
    }
  },

  updateGPSAddressBuyer: async (parent, args, context, info) => {
    global.logger.info('buyerMutation::updateAddress' + JSON.stringify(args));
    let { latitude, longitude } = args;

    // check has login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    // get address from latlng
    let address = await hereUtils.getAddressFromLatLng(latitude, longitude);

    if (!address) {
      throw new Error('Không tìm thấy địa chỉ');
    }

    // check buyer
    let buyer = await Buyer.findOne({ accountId: context.user.id });

    if (!buyer) {
      throw new Error('Bạn chưa đăng ký là người mua');
    }

    // update address
    await Buyer.findOneAndUpdate({ accountId: context.user.id }, { address, location: { type: 'Point', coordinates: [longitude, latitude] } });

    return address
  },

  addVendorFavorite: async (parent, args, context, info) => {
    global.logger.info('buyerMutation::addVendorFavorite' + JSON.stringify(args));

    // check has login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    // check has buyer
    let buyer = await Buyer.findOne({ accountId: context.user.id });

    if (!buyer) {
      throw new Error('Bạn chưa đăng ký là người mua');
    }

    // check has vendor
    let vendor = await Vendor.findById(args.vendorId);

    if (!vendor) {
      throw new Error('Cừa hàng này không tồn tại');
    }

    if (args.isAdd) {
      // check has favorite
      let favorite = await VendorFavorite.findOne({ buyerId: buyer._id, vendorId: vendor._id });

      if (favorite) {
        return true;
      }
      // add favorite
      await VendorFavorite.create({ buyerId: buyer._id, vendorId: vendor._id });
    } else {
      // remove favorite
      await VendorFavorite.deleteOne({ buyerId: buyer._id, vendorId: vendor._id });
    }

    return true;
  },

  updateBuyerProfile: async (parent, args, context, info) => {
    global.logger.info('buyerMutation::updateBuyerProfile' + JSON.stringify(args));

    const { name, image } = args;

    // check has login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    // check has buyer
    if (!context.user.isBuyer) {
      throw new Error('Bạn chưa đăng ký là người mua');
    }

    const buyer = await Buyer.findOne({ accountId: context.user.id });
    // check has buyer
    if (!buyer) {
      throw new Error('Bạn chưa đăng ký là người mua');
    }

    // update buyer
    return await Buyer.findOneAndUpdate({ accountId: context.user.id }, { name, image }, { new: true });

  }
}

export default buyerMutation;