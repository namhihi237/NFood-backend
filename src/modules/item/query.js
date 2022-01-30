import { Accounts, Order, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import mongoose from 'mongoose';

import _ from 'lodash';

const itemQuery = {
  getAllItem: async (root, args, context, info) => {
    global.logger.info('itemQuery::getAllItems');

    const { user } = context;

    // check login
    if (!user) {
      throw new Error('Bạn chưa dăng nhập');
    }

    const vendor = await Vendor.findOne({ accountId: user.id });

    if (!vendor) {
      throw new Error('Bạn chưa có cửa hàng');
    }

    let items = await Item.aggregate([
      {
        $match: {
          vendorId: mongoose.Types.ObjectId(vendor._id)
        },
      },
      {
        $lookup: {
          from: 'category',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
    ]);

    items = JSON.parse(JSON.stringify(items));

    return items;
  },

  getReportItem: async (root, args, context, info) => {
    global.logger.info('=========itemQuery::getReportItem========', JSON);

    const { type, time } = args;
    // check login
    if (!context.user) {
      throw new Error('Bạn chưa dăng nhập');
    }

    const vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa có cửa hàng');
    }

    let items = await Item.find({ vendorId: vendor._id });

    let startDate = null;
    let endDate = null;

    if (type === 'DATE') {
      startDate = new Date(time);
      endDate = new Date(time);
      endDate.setDate(endDate.getDate() + 1);
    } else if (type === 'MONTH') {

      startDate = new Date(time);
      startDate.setDate(1);
      endDate = new Date(time);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(1);
    }

    // calculate total revenue of item
    const itemsPromise = items.map(async item => {
      // find all order has item
      const orders = await Order.find({
        vendorId: vendor._id,
        orderStatus: 'Delivered',
        createdAt: {
          $gte: startDate,
          $lt: endDate
        },
        orderItems: {
          $elemMatch: {
            itemId: item._id
          }
        }
      });

      let quantitySold = 0, totalRevenue = 0;
      orders.forEach(order => {
        order.orderItems.forEach(orderItem => {
          if (orderItem.itemId.toString() === item._id.toString()) {
            quantitySold += orderItem.quantity;
            totalRevenue += orderItem.quantity * orderItem.price;
          }
        });
      });

      return {
        ...item._doc,
        quantitySold,
        totalRevenue
      };
    });

    items = await Promise.all(itemsPromise);
    return items;
  }
};


export default itemQuery;