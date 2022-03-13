import { Accounts, Order, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import _ from 'lodash';
import mongoose, { mongo } from 'mongoose';
import orderService from "./orderService";

const orderQuery = {
  calculateShipping: async (path, args, context, info) => {
    global.logger.info('orderQuery::calculateShipping' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    return await orderService.calculateShippingCost(context.user.id, args.vendorId);
  },

  getOrderByVendor: async (path, args, context, info) => {
    global.logger.info('orderQuery::orders' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const vendor = await Vendor.findOne({ accountId: context.user.id });

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
      {
        $lookup: {
          from: 'buyer',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'buyer'
        }
      },
      {
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          acceptedShippingAt: -1
        }
      }
    ]);

    return orders;
  },

  getOrderByDistances: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderByDistances' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const shipper = await Shipper.findOne({ accountId: context.user.id });

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

    const shipper = await Shipper.findOne({ accountId: context.user.id });

    if (!shipper) {
      throw new Error('Bạn không phải là người giao hàng');
    }

    const orders = await Order.find({ shipperId: shipper._id }).sort({ createdAt: -1 });

    return orders;
  },

  getOrderByBuyer: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderByBuyer' + JSON.stringify(args));

    // check login and role
    const buyer = await Buyer.findOne({ accountId: context.user.id });

    if (!buyer) {
      throw new Error('Bạn không phải là người mua hàng');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          ownerId: mongoose.Types.ObjectId(buyer._id),
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
      {
        $lookup: {
          from: 'vendor',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: {
          path: '$vendor',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    return orders;
  },

  getOrderById: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderShipping' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const shipper = await Shipper.findOne({ accountId: context.user.id });

    if (!shipper) {
      throw new Error('Bạn không phải là người giao hàng');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(args.id),
          shipperId: mongoose.Types.ObjectId(shipper._id),
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
      {
        $lookup: {
          from: 'shipper',
          localField: 'shipperId',
          foreignField: '_id',
          as: 'shipper'
        },
      },
      {
        $unwind: {
          path: '$shipper',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'buyer',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'buyer'
        }
      },
      {
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    if (orders.length == 0) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    return orders[0];
  },

  getOrderByIdBuyer: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getOrderByIdBuyer' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const buyer = await Buyer.findOne({ accountId: context.user.id });

    if (!buyer) {
      throw new Error('Bạn không phải là người mua hàng');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(args.id),
          ownerId: mongoose.Types.ObjectId(buyer._id),
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
      {
        $lookup: {
          from: 'shipper',
          localField: 'shipperId',
          foreignField: '_id',
          as: 'shipper'
        },
      },
      {
        $unwind: {
          path: '$shipper',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])

    return orders[0]

  },

  getNewOrderByVendor: async (parent, args, context, info) => {
    global.logger.info('orderQuery::getNewOrderByVendor' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn không phải là người bán hàng');
    }

    const orders = await Order.aggregate([
      {
        $match: {
          vendorId: mongoose.Types.ObjectId(vendor._id),
          orderStatus: {
            $in: ['Pending', 'Processing']
          }
        }
      },
      {
        $lookup: {
          from: 'shipper',
          localField: 'shipperId',
          foreignField: '_id',
          as: 'shipper'
        },
      },
      {
        $unwind: {
          path: '$shipper',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'buyer',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'buyer'
        },
      },
      {
        $unwind: {
          path: '$buyer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    return orders;
  }
};

export default orderQuery;