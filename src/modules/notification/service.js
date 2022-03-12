import { Transaction, Order, Buyer, Vendor, Shipper, Notification, Item } from "../../models";
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

  async createNotificationShipper(content, orderId, shipperId, pubsub) {
    const shipper = await Shipper.findOne({ _id: shipperId });

    await Notification.create({
      content,
      orderId,
      userId: shipper.accountId,
      userType: 'shipper'
    });

    const numberOfNotifications = shipper.numberOfNotifications ? shipper.numberOfNotifications + 1 : 1;

    await Shipper.updateOne({ _id: shipperId }, { numberOfNotifications });

    pubsub.publish(`NUMBER_OF_NOTIFICATIONS_${shipper.accountId}_shipper`, {
      numberOfNotifications
    });
  }
}

export default new NotificationService();