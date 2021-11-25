import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';

const shipperMutation = {
  activeShipper: async (parent, args, context, info) => {
    global.logger.info('shipperMutation::activeShipper' + JSON.stringify(args));
    const { name, image } = args;
    if (!context.user) {
      throw new Error('Bạn chưa đăng ký tài khoản');
    }

    let account = await Accounts.findById(context.user.id);

    if (!account) {
      throw new Error('Tài khoản không tồn tại');
    }

    if (account.isShipper) {
      throw new Error('Bạn đã là người giao hàng');
    }

    let shipper = await Shipper.findOne({ accountId: account._id });

    if (shipper) {
      await Shipper.findOneAndUpdate({ accountId: account._id }, { name, image });
    } else {
      await Shipper.create({ accountId: account._id, name, image });
    }

    await Accounts.findByIdAndUpdate(account._id, { isShipper: true, });
    if (!account.role.includes('shipper')) {
      await Accounts.findByIdAndUpdate(account._id, { $push: { role: 'shipper' } });
    }

    return {
      success: true,
      message: 'Bạn trở thành người giao hàng!'
    }
  }
};

export default shipperMutation;