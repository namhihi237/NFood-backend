import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper } from "../../models";

import _ from 'lodash';

const buyerMutation = {
  setNameBuyer: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::setNameBuyer' + JSON.stringify(args));
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
      await Buyer.create({ accountId: account._id, name });
    }

    if (!account.role.includes('buyer')) {
      await Accounts.findByIdAndUpdate(context.user.id, { isBuyer: true, $push: { role: 'buyer' } });
    }

    return {
      success: true,
      message: 'Bạn đã đăng ký thành công, tiến hành mua hàng thôi nào.'
    }
  },

  updateGPSAddressBuyer: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::updateAddress' + JSON.stringify(args));
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

  }

}

export default buyerMutation;