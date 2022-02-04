import { bcryptUtils, emailUtils, jwtUtils, queue } from '../../utils';
import { Accounts, Notification, Buyer, Vendor, Shipper, Transaction, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import orderService from "./orderService";
import { notificationService } from "../notification";

const orderMutation = {
  checkout: async (path, args, context, info) => {
    global.logger.info(`orderMutation::checkout=====` + JSON.stringify(args));

    const { method } = args
    const session = await mongoose.startSession();
    try {
      // check login
      if (!context.user) {
        throw new Error('Bạn chưa đăng nhập');
      }
      const account = await Accounts.findOne({ _id: context.user.id });
      const buyer = await Buyer.findOne({ accountId: account._id });

      // find all items in the cart
      const cartItems = await Cart.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(context.user.id) } },
        { $lookup: { from: 'item', localField: 'itemId', foreignField: '_id', as: 'item' } },
        { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } }
      ]);

      if (cartItems.length == 0) {
        throw new Error("Bạn không có món ăn nào trong giỏ");
      }
      const vendorId = _.uniq(_.map(cartItems, 'item.vendorId'))[0];

      const vendor = await Vendor.findOne({ _id: vendorId });

      // check vendor is ready to accept order
      if (!vendor.isReceiveOrder) {
        throw new Error("Cửa hàng này hiện không nhận đơn hàng");
      }

      // calculate total price
      let subTotal = 0;
      cartItems.forEach(cartItem => {
        subTotal += cartItem.item.price * cartItem.quantity;
      });

      // calculate shipping fee
      let shipping = await orderService.calculateShippingCost(context.user.id, vendorId);
      // calculate discount
      let discount = 0;
      if (args.promoCode) {
        discount = await orderService.calculateDiscount(vendorId, buyer._id, args.promoCode, subTotal);
        if (!discount) {
          args.promoCode = null;
          discount = 0;
        }
      }

      // calculate total price
      let total = subTotal + shipping - discount;

      // calculate delivery time base on distance
      let now = new Date();
      let estimatedDeliveryTime = new Date(now.getTime() + (5 * 1000));


      let orderItems = [];
      cartItems.forEach(cartItem => {
        orderItems.push({
          itemId: cartItem.item._id,
          buyerId: buyer._id,
          buyerName: buyer.name,
          name: cartItem.item.name,
          quantity: cartItem.quantity,
          price: cartItem.item.price,
          note: cartItem.note,
          image: cartItem.item.image
        })
      });

      await session.startTransaction();

      let order = null;

      const invoiceNumber = await orderService.generateInvoiceNumber();

      if (method === 'COD') {
        global.logger.info('cartMutation::checkout::order::COD' + JSON.stringify({ total, shipping, discount, subTotal }));

        order = await Order.create([{
          ownerId: buyer._id,
          vendorId,
          name: buyer.name,
          address: buyer.address,
          phoneNumber: account.phoneNumber,
          invoiceNumber,
          discount,
          shipping,
          subTotal,
          promoCode: args.promoCode,
          total,
          estimatedDeliveryTime,
          orderItems,
          paymentMethod: 'COD',
          location: {
            type: 'Point',
            coordinates: [vendor.location.coordinates[0], vendor.location.coordinates[1]]
          }
        }], { session });

        order = order[0];

      } else if (method === 'CRE') {
        throw new Error('Not implemented')
      }

      await Cart.deleteMany({ userId: account._id }, { session });

      await session.commitTransaction();
      session.endSession();

      return order;

    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  acceptShippingOrder: async (path, args, context, info) => {
    global.logger.info('orderQuery::acceptShippingOrder' + JSON.stringify(args));

    const { orderId } = args;

    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check has order receiving
    const shipper = await Shipper.findOne({ accountId: context.user.id });

    if (!shipper) {
      throw new Error('Bạn không có quyền này');
    }

    if (shipper.isReceiveOrder) {
      throw new Error('Bạn đang có đơn hàng đang cần giao');
    }

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.orderStatus !== 'Pending') {
      throw new Error('Đơn hàng này không thể chấp nhận');
    }

    // check money amount
    if (order.subTotal > shipper.money) {
      throw new Error('Bạn không đủ tiền để chấp nhận đơn hàng');
    }

    // update status shipper
    await Shipper.findOneAndUpdate({ accountId: context.user.id }, { isReceiveOrder: true, currentOrderId: order._id }, { new: true });

    // update status of order
    await Order.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'Processing', shipperId: shipper._id, acceptedShippingAt: new Date() }, {
      new: true
    });

    // return order with vendor
    const orders = await Order.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(orderId) } },
      { $lookup: { from: 'vendor', localField: 'vendorId', foreignField: '_id', as: 'vendor' } },
      { $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } }
    ]);

    const content_buyer = `Đơn hàng ${order.invoiceNumber} đã được chấp nhận, người giao hàng đang đi lấy hàng`;
    const content_vendor = `Bạn vừa có đơn hàng mới vui lòng chuẩn bị để người giao hàng đến lấy hàng`;

    // charge money to system
    await Shipper.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: -order.subTotal } });

    // create transaction
    await Transaction.create({
      userId: shipper._id,
      type: 'payment',
      amount: order.subTotal,
      currency: 'VND',
    });

    await notificationService.createNotificationBuyer(content_buyer, orderId, order.ownerId, context.pubsub);
    await notificationService.createNotificationVendor(content_vendor, orderId, order.vendorId, context.pubsub);

    return orders[0];
  },

  pickUpOrder: async (path, args, context, info) => {
    global.logger.info('orderQuery::pickUpOrder' + JSON.stringify(args));

    const { orderId } = args;

    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const shipper = await Shipper.findOne({ accountId: context.user.id });

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }


    if (JSON.stringify(order.shipperId) !== JSON.stringify(shipper._id)) {
      throw new Error('Đơn hàng này không thuộc về bạn');
    }

    // update status order
    await Order.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'Shipping', pickedUpAt: new Date() });

    // charge money to vendor
    await Vendor.findByIdAndUpdate(order.vendorId, { $inc: { money: order.subTotal } });

    return true;
  },

  completeShippingOrder: async (path, args, context, info) => {
    global.logger.info('orderQuery::completeShippingOrder' + JSON.stringify(args));

    const { orderId } = args;

    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const shipper = await Shipper.findOne({ accountId: context.user.id });

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }


    if (JSON.stringify(order.shipperId) !== JSON.stringify(shipper._id)) {
      throw new Error('Đơn hàng này không thuộc về bạn');
    }

    // update status order
    await Order.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'Delivered', deliveredAt: new Date() });

    // update status shipper
    await Shipper.findOneAndUpdate({ accountId: context.user.id }, { isReceiveOrder: false, currentOrderId: null });

    // charge money to shipper if payment is cre
    if (order.paymentMethod === 'CRE') {
      await Shipper.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: order.shipping } });
    }

    return true;
  },

  cancelOrder: async (path, args, context, info) => {
    global.logger.info('orderQuery::cancelOrder' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const order = await Order.findById({ _id: args.id });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // check status of order
    if (order.orderStatus !== 'Pending') {
      throw new Error('Đơn hàng này không thể hủy');
    }

    // update status order
    await Order.findByIdAndUpdate({ _id: args.id }, { orderStatus: 'Cancelled', cancelledAt: new Date() });

    return true;
  }


};


export default orderMutation;