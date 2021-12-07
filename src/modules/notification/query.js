import { bcryptUtils, emailUtils, jwtUtils, logger, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Notification } from "../../models";
import mongoose from 'mongoose';
import _ from 'lodash';

const notificationQuery = {
  getNotifications: async (parent, args, context, info) => {
    global.logger.info('notification::getNotifications' + JSON.stringify(args));

    const { skip = 0, limit = 20 } = args;
    global.logger.info('notification::getNotifications skip: ' + skip + ' limit: ' + limit);
    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const notifications = await Notification.find({
      userId: account._id,
      userType: args.userType,
    }).skip(skip).limit(limit).sort({ createdAt: -1 });

    const total = await Notification.countDocuments({
      accountId: account._id,
      userType: args.userType,
    });

    return { items: notifications, total };
  },

  getNumberOfNotifications: async (parent, args, context, info) => {
    global.logger.info('notification::getNumberOfNotifications' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    let user;
    if (args.userType === 'buyer') {
      user = await Buyer.findOne({ accountId: account._id });
    } else if (args.userType === 'vendor') {
      user = await Vendor.findOne({ accountId: account._id });
    } else if (args.userType === 'shipper') {
      user = await Shipper.findOne({ accountId: account._id });
    }

    return user.numberOfNotifications ? user.numberOfNotifications : 0;
  }
}

export default notificationQuery;