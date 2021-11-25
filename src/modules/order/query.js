import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Order, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import { constants } from "../../configs";
import orderService from "./orderService";

const orderQuery = {
  calculateShipping: async (path, args, context, info) => {
    global.logger.info('orderQuery::calculateShipping' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    return await orderService.calculateShippingCost(context.user._id, args.vendorId);
  },

  orders: async (path, args, context, info) => {
    global.logger.info('orderQuery::orders' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const buyer = await Buyer.findOne({ accountId: account._id });

    const orders = await Order.find({ ownerId: buyer._id });
    console.log(orders);

    return orders;

  }
};

export default orderQuery;