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

  getVendorOrders: async (path, args, context, info) => {
    global.logger.info('orderQuery::orders' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const buyer = await Buyer.findOne({ accountId: account._id });

    const orders = await Order.find({ ownerId: buyer._id });

    return orders;

  },

  getOrderByDistances: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderByDistances' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const shipper = await Shipper.findOne({ accountId: account._id });
    const maxDistance = shipper.maxReceiveOrderDistance;

    global.logger.info('maxDistance: ' + maxDistance);

    // get order by max distance
    return Order.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [shipper.location.coordinates[0], shipper.location.coordinates[1]]
          },
          distanceField: "distance",
          maxDistance: maxDistance * 1000,
          spherical: true
        },
      },
      {
        $match: {
          orderStatus: "Pending"
        }
      },
      {
        // lockup vendor
        $lookup: {
          from: "vendor",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor"
        },
      },
      {
        $unwind: {
          path: '$vendor',
          preserveNullAndEmptyArrays: true
        }
      },
    ]);
  }
};

export default orderQuery;