import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Order, Buyer, Vendor, Shipper, Notification, Item } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import { constants } from "../../configs";
class NotificationService {
  async createNotificationBuyer(content, orderId, buyerId, pubsub) {
    const buyer = await Buyer.findOne({ _id: buyerId });

    await Notification.create({
      content,
      orderId,
      userId: buyer.accountId,
      userType: 'buyer'
    });

    const numberOfNotifications = buyer.numberOfNotifications ? buyer.numberOfNotifications + 1 : 1;

    await Buyer.updateOne({ _id: buyerId }, { numberOfNotifications });

    pubsub.publish(`NUMBER_OF_NOTIFICATIONS_${buyer.accountId}_buyer`, {
      numberOfNotifications
    });
  }

  async createNotificationVendor(content, orderId, vendorId, pubsub) {
    const vendor = await Vendor.findOne({ _id: vendorId });

    await Notification.create({
      content,
      orderId,
      userId: vendor.accountId,
      userType: 'vendor'
    });

    const numberOfNotifications = vendor.numberOfNotifications ? vendor.numberOfNotifications + 1 : 1;

    await Vendor.updateOne({ _id: vendorId }, { numberOfNotifications });

    pubsub.publish(`NUMBER_OF_NOTIFICATIONS_${vendor.accountId}_vendor`, {
      numberOfNotifications
    });
  }

}

export default new NotificationService();