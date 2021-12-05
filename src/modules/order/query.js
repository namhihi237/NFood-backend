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

  getOrderByVendor: async (path, args, context, info) => {
    global.logger.info('orderQuery::orders' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const vendor = await Vendor.findOne({ accountId: account._id });

    if (!vendor) {
      throw new Error('Bạn không phải là nhà bán hàng');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          vendorId: vendor._id,
        }
      },
      {
        $lookup: {
          from: 'shipper',
          localField: 'shipperId',
          foreignField: '_id',
          as: 'shipper'
        }
      },
      {
        $unwind: {
          path: '$shipper',
          preserveNullAndEmptyArrays: true
        }
      },
    ]);

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

    if (!shipper) {
      throw new Error('Bạn không phải là người giao hàng');
    }

    const maxDistance = shipper.maxReceiveOrderDistance;

    global.logger.info('maxDistance: ' + maxDistance);

    // get order by max distance
    const orders = await Order.aggregate([
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

    return orders;
  },

  getOrderByShipper: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderByShipper' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const shipper = await Shipper.findOne({ accountId: account._id });

    if (!shipper) {
      throw new Error('Bạn không phải là người giao hàng');
    }

    const orders = await Order.find({ shipperId: shipper._id });

    return orders;
  },

  getOrderByBuyer: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderByBuyer' + JSON.stringify(args));

    // check login and role
    const account = await Accounts.findOne({ _id: context.user._id });

    const buyer = await Buyer.findOne({ accountId: account._id });

    if (!buyer) {
      throw new Error('Bạn không phải là người mua hàng');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          buyerId: buyer._id,
        }
      },
      {
        $lookup: {
          from: 'shipper',
          localField: 'shipperId',
          foreignField: '_id',
          as: 'shipper'
        }
      },
      {
        $unwind: {
          path: '$shipper',
          preserveNullAndEmptyArrays: true
        }
      },
    ]);

    return orders;
  },

  getOrderById: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderShipping' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const shipper = await Shipper.findOne({ accountId: account._id });

    if (!shipper) {
      throw new Error('Bạn không phải là người giao hàng');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          _id: args.id,
          shipperId: shipper._id,
        }
      },
      {
        $lookup: {
          from: 'vendor',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        },
      },
      {
        $unwind: {
          path: '$vendor',
          preserveNullAndEmptyArrays: true
        }
      },
    ]);

    return orders[0];
  }
};

export default orderQuery;