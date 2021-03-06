import { bcryptUtils, emailUtils, jwtUtils, logger, smsUtils } from '../../utils';
import { Voucher, CodeResets, Buyer, Vendor, Order, Category } from "../../models";
import mongoose from 'mongoose';
import _ from 'lodash';
import queue from 'bee-queue';
import { constants } from '../../configs';
import { categoryEnum } from './enum';

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

    // get menu of vendor
    vendors = await Promise.all(vendors.map(async (vendor) => {
      let menu = await Category.find({ vendorId: vendor._id, isActive: true });
      vendor.menu = menu;
      return vendor;
    }));

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

    // get all voucher of vendor
    const vouchers = await Voucher.find({ vendorId: vendor._id, isActive: true });
    vendor.vouchers = vouchers;

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
        pickedUpAt: {
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
        pickedUpAt: {
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
      totalRevenue: parseInt(totalRevenue * constants.VENDOR_PERCENT_PER_ORDER),
      totalOrder, totalOrderCompleted, accountBalance
    };
  },

  getAllVendors: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::getAllVendors::' + JSON.stringify(args));
    const { page = 1, limit = 20, keyword, isPromotion, categoryKeyword } = args;

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

      // get all vendors has voucher
      let vouchers = null;

      if (isPromotion) {
        vouchers = await Voucher.find({
          isActive: true,
        });
      }

      if (!keyword) {
        let conditions = [
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
              isActive: true,
            }
          },
        ]

        if (vouchers) {
          conditions[1].$match = {
            ...conditions[1].$match,
            _id: { $in: vouchers.map(v => v.vendorId) }
          }
        }

        // find the vendors
        vendors = await Vendor.aggregate(conditions).skip((page - 1) * limit).limit(limit);

        conditions.push({ $count: "total" });

        const totalDocuments = await Vendor.aggregate(conditions);

        total = totalDocuments[0] ? totalDocuments[0].total : 0;
      } else if (keyword) {
        const vendorsSearch = await Vendor.find(
          {
            isReceiveOrder: true,
            isActive: true,
            $text: {
              $search: keyword
            }
          }
        );

        let conditions = [{
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            distanceField: "distance",
            maxDistance: (args.distance || 10) * 1000, // meters
            spherical: true,
          }
        },
        {
          $match: {
            _id: {
              $in: vendorsSearch.map(vendor => vendor._id)
            }
          }
        }];

        if (vouchers) {
          const ids = _.intersection(vouchers.map(v => v.vendorId.toString()), vendorsSearch.map(v => v._id.toString()))
            .map(id => mongoose.Types.ObjectId(id));

          conditions[1].$match = {
            ...conditions[1].$match,
            _id: { $in: ids }
          }
        }

        vendors = await Vendor.aggregate(conditions).skip((page - 1) * limit).limit(limit);

        total = await Vendor.countDocuments({
          isReceiveOrder: true, isActive: true,
          $text: {
            $search: keyword
          }
        });
      }
    }

    // get menu of vendor

    let conditionCategory = {
      isActive: true,
      isDelete: false,
    }

    if (categoryKeyword) {
      conditionCategory.$text = {
        $search: categoryEnum[categoryKeyword].join(' ')
      }
    }

    vendors = await Promise.all(vendors.map(async (vendor) => {
      const menu = await Category.find({ ...conditionCategory, vendorId: vendor._id }, {
        _id: 1, name: 1
      });
      vendor.menu = menu;
      return vendor;
    }));

    vendors = vendors.filter(vendor => vendor.menu && vendor.menu.length > 0);

    return {
      items: vendors, total
    }
  },

  checkVendorOpen: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::checkVendorOpen::' + JSON.stringify(args));

    const { vendorId } = args;

    // find the vendor
    const vendor = await Vendor.findOne({ _id: vendorId });

    if (!vendor) {
      throw new Error('Cừa hàng không tồn tại');
    }

    if (!vendor.isReceiveOrder) {
      return false;
    }

    // check timeOpen
    const timeOpen = vendor.timeOpen;
    let currentTime = new Date();
    // add 7 hours to current time
    currentTime.setHours(currentTime.getHours() + 7);
    const currentDay = currentTime.getDay();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // convert currentDay to string
    let currentDayString = "";
    if (currentDay === 0) {
      currentDayString = "8";
    } else {
      currentDayString = (currentDay + 1).toString();
    }

    // check timeOpen
    const timeOpenItem = _.find(timeOpen, { day: currentDayString, isOpen: true });
    if (!timeOpenItem) {
      return false
    }

    // check timeOpen
    const start = parseFloat(timeOpenItem.openTime.getHours() + "." + timeOpenItem.openTime.getMinutes());
    const end = parseFloat(timeOpenItem.closeTime.getHours() + "." + timeOpenItem.closeTime.getMinutes());
    const current = parseFloat(currentHour + "." + currentMinute);

    if (current < start || current > end) {
      return false;
    }

    return true;
  }
}

export default vendorQuery;