import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import moment from 'moment';

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
  },

  // type Report {
  //  deliveryMoney: Float!
  //  buyOrderMoney: Float!
  //  rewardMoney: Float!
  //  balanceWallet: Float!
  // }

  getReportsByShipper: async (parent, args, context, info) => {
    global.logger.info('shipperQuery::getReportsByShipper' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const shipper = await Shipper.findOne({ accountId: context.user.id });

    if (!shipper) {
      throw new Error('Bạn chưa là người giao hàng');
    }

    const deliveryMoney = await Order.aggregate([
      {
        $match: {
          shipperId: shipper._id,
          orderStatus: 'Delivered'
        }
      },
      {
        $group: {
          _id: null,
          deliveryMoney: { $sum: '$shipping' },
        }
      },
    ]);

    const buyOrderMoney = await Order.aggregate([
      {
        $match: {
          shipperId: shipper._id,
          orderStatus: 'Delivered',
          paymentMethod: 'COD' // pay for vendor
        }
      },
      {
        $group: {
          _id: null,
          buyOrderMoney: { $sum: '$subTotal' },
        }
      },
    ]);

    const totalOrder = await Order.countDocuments({
      shipperId: shipper._id,
      orderStatus: 'Delivered'
    });

    return {
      deliveryMoney: deliveryMoney[0].deliveryMoney || 0,
      buyOrderMoney: buyOrderMoney[0].buyOrderMoney || 0,
      rewardMoney: 0,
      balanceWallet: shipper.money || 0,
      totalOrder
    }
  },

  // type IncomeShipper {
  //    totalIncome: Float!
  //    totalShipping: Float!
  //    rewardPoint: Float! 

  // }
  getIncomesByShipper: async (parent, args, context, info) => {
    global.logger.info('shipperQuery::getIncomesByShipper' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const shipper = await Shipper.findOne({ accountId: context.user.id });

    if (!shipper) {
      throw new Error('Bạn chưa là người giao hàng');
    }

    const { type, time } = args;

    let startDate = null, endDate = null;
    if (type === 'DATE') {
      startDate = new Date(`${time}T00:00:00.000Z`)
      endDate = new Date(`${time}T23:59:59.999Z`)
    } else if (type === 'MONTH') {
      startDate = new Date(`${time}-01T00:00:00.000Z`)
      endDate = new Date(startDate).setMonth(startDate.getMonth() + 1)
    }

    global.logger.info('shipperQuery::getIncomesByShipper::startDate: ' + startDate);
    global.logger.info('shipperQuery::getIncomesByShipper::endDate: ' + endDate);

    const orders = await Order.find({
      shipperId: shipper._id,
      orderStatus: 'Delivered',
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    let totalShipping = 0;
    orders.forEach(order => {
      totalShipping += order.shipping;
    })

    return {
      totalShipping,
      rewardPoint: 0,
      totalOrder: orders.length
    }

  },
};

export default shipperQuery;