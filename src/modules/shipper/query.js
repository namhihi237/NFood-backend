import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';

const shipperQuery = {
  getMaxDistanceFindOrder: async (parent, args, context, info) => {
    global.logger.info('shipperQuery::getMaxDistanceFindOrder' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const shipper = await Shipper.findOne({ accountId: context.user.id });

    if (!shipper) {
      throw new Error('Bạn chưa là người giao hàng');
    }

    return shipper.maxReceiveOrderDistance;
  }
};

export default shipperQuery;