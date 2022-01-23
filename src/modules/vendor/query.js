import { bcryptUtils, emailUtils, jwtUtils, logger, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Order, Category } from "../../models";
import mongoose from 'mongoose';
import _ from 'lodash';
import queue from 'bee-queue';

const vendorQuery = {
  vendors: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::vendors::===============' + JSON.stringify(args));

    let { latitude, longitude } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // let account = await Accounts.findById(context.user.id);

    if (!latitude || !longitude) {
      // get location from buyer
      const buyer = await Buyer.findOne({ accountId: context.user.id }, { location: 1 });

      if (!buyer) {
        throw new Error('Bạn chưa là người mua');
      }

      logger.info('buyer: ' + buyer);
      if (buyer.location && buyer.location.coordinates && buyer.location.coordinates.length > 0) {
        logger.info('buyer.location: ' + buyer.location);
        latitude = buyer.location.coordinates[1];
        longitude = buyer.location.coordinates[0];
      }
    }

    if (!latitude || !longitude) {
      throw new Error('Không tìm thấy vị trí của bạn');
    }

    let vendors = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance",
          maxDistance: (args.distance || 5) * 1000, // meters
          spherical: true,
        }
      }, {
        $match: {
          isReceiveOrder: true, isActive: true
        }
      }
    ]);

    global.logger.info('vendorQuery::' + vendors.length);

    let total = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance",
          maxDistance: (args.distance || 5) * 1000, // meters
          spherical: true,
        },
      }, {
        $match: {
          isReceiveOrder: true, isActive: true
        },
      }, {

        $count: "total"
      }
    ]);

    logger.info('total: ' + JSON.stringify(total));

    return {
      items: vendors, total: total[0] ? total[0].total : 0
    };
  },

  // get detail of vendor
  vendor: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::vendor::' + JSON.stringify(args));

    let vendor = await Vendor.findOne({ _id: args.id });

    if (!vendor) {
      throw new Error('Không tìm thấy cửa hàng');
    }

    global.logger.info('vendorQuery::vendor::' + JSON.stringify(vendor));

    // get menu of vendor
    const menu = await Category.find({ vendorId: vendor._id, isActive: true });

    vendor.menu = menu;

    return vendor;
  },

  // type Report {
  //   totalRevenue: Float!
  //   totalOrder: Int!
  //   totalOrderCompleted: Int!
  //   accountBalance: Float!
  // }
  vendorReport: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::vendorReport::' + JSON.stringify(args));

    const { type, time } = args;

    // check login
    if (!context.user) {
      3
      throw new Error('Bạn chưa đăng nhập');
    }

    const vendor = await Vendor.findOne({ accountId: context.user.id });
    if (!vendor) {
      throw new Error('Bạn chưa là người bán hàng');
    }

    let totalRevenue = 0;
    let totalOrder = 0;
    let totalOrderCompleted = 0;
    let accountBalance = 0;
    let orders = [];

    if (type === 'DATE') {
      // get report by date

      // convert date to timestamp start day
      const startDate = new Date(time);
      const endDate = new Date(time);
      endDate.setDate(endDate.getDate() + 1);

      // get orders
      orders = await Order.find({
        vendorId: vendor._id,
        createdAt: {
          $gte: startDate,
          $lt: endDate
        }
      });

    } else if (type === 'MONTH') {
      // get report by month

      // convert date to timestamp start month
      const startDate = new Date(time);
      startDate.setDate(1);
      const endDate = new Date(time);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(1);

      // get orders
      orders = await Order.find({
        vendorId: vendor._id,
        createdAt: {
          $gte: startDate,
          $lt: endDate
        }
      });
    }

    // get all order completed

    if (orders && orders.length > 0) {
      totalOrder = orders.length;
      const ordersDelivered = orders.filter(order => order.orderStatus === 'Delivered');
      if (ordersDelivered.length > 0) {
        totalOrderCompleted = orders.length;
        // get total revenue
        for (let i = 0; i < ordersDelivered.length; i++) {
          totalRevenue += (orders[i].subTotal - orders[i].discount);
        }
      }
    }

    // get account balance
    accountBalance = vendor.money;

    return {
      totalRevenue, totalOrder, totalOrderCompleted, accountBalance
    };
  },

  getAllVendors: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::getAllVendors::' + JSON.stringify(args));
    const { page = 1, limit = 20, keyword } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const buyer = await Buyer.findOne({ accountId: context.user.id });

    if (!buyer) {
      throw new Error('Bạn chưa là người mua');
    }

    let latitude = null, longitude = null;

    if (buyer.location && buyer.location.coordinates && buyer.location.coordinates.length > 0) {
      logger.info('buyer.location: ' + buyer.location);
      latitude = buyer.location.coordinates[1];
      longitude = buyer.location.coordinates[0];
    }

    let vendors = [];
    let total = 0;
    if (!latitude || !longitude) {
      // find the vendors
      vendors = await Vendor.find(
        {
          isReceiveOrder: true, isActive: true,
          $text: { $search: keyword }
        },
      ).skip((page - 1) * limit).limit(limit);

      total = await Vendor.countDocuments({
        isReceiveOrder: true, isActive: true,
        $text: {
          $search: keyword
        }
      });

    } else if (latitude && longitude) {
      if (!keyword) {
        // find the vendors
        vendors = await Vendor.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              distanceField: "distance",
              maxDistance: (args.distance || 10) * 1000, // meters
              spherical: true,
            }
          }, {
            $match: {
              isReceiveOrder: true,
              isActive: true
            }
          },

        ]).skip((page - 1) * limit).limit(limit);

        const totalDocuments = await Vendor.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              distanceField: "distance",
              maxDistance: (args.distance || 10) * 1000, // meters
              spherical: true,
            }
          }, {
            $match: {
              isReceiveOrder: true,
              isActive: true
            }
          }, {
            $count: "total"
          }
        ]);

        total = totalDocuments[0] ? totalDocuments[0].total : 0;
      } else if (keyword) {
        vendors = await Vendor.find(
          {
            isReceiveOrder: true, isActive: true,
            $text: {
              $search: keyword
            }
          }
        ).skip((page - 1) * limit).limit(limit);

        total = await Vendor.countDocuments({
          isReceiveOrder: true, isActive: true,
          $text: {
            $search: keyword
          }
        });
      }
    }

    return {
      items: vendors, total
    }
  }
}

export default vendorQuery;