import { bcryptUtils, emailUtils, jwtUtils, queue } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import orderService from "./orderService";

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
      const account = await Accounts.findOne({ _id: context.user._id });
      const buyer = await Buyer.findOne({ accountId: account._id });

      // find all items in the cart
      const cartItems = await Cart.aggregate([
        { $match: { userId: context.user._id } },
        { $lookup: { from: 'item', localField: 'itemId', foreignField: '_id', as: 'item' } },
        { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } }
      ]);

      if (cartItems.length == 0) {
        throw new Error("Bạn không có món ăn nào trong giỏ");
      }
      const vendorId = _.uniq(_.map(cartItems, 'item.vendorId'))[0];

      const vendor = await Vendor.findOne({ _id: vendorId });

      // calculate total price
      let subTotal = 0;
      cartItems.forEach(cartItem => {
        subTotal += cartItem.item.price * cartItem.quantity;
      });

      // calculate shipping fee
      let shipping = await orderService.calculateShippingCost(context.user._id, vendorId);

      // calculate discount
      let discount = 0;

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
          total,
          estimatedDeliveryTime,
          orderItems,
          location: {
            type: 'Point',
            coordinates: [vendor.location.coordinates[0], vendor.location.coordinates[1]]
          }
        }], { session });

        order = order[0];

      } else if (method === 'ONLINE') {
        throw new Error('Not implemented')
      }

      await Cart.deleteMany({ userId: account._id }, { session });

      await session.commitTransaction();
      session.endSession();

      // push notification to shipper to accept shipping order
      // const job = queue.queue.createJob(order._id);
      // job.save();

      // job.on('succeeded', (result) => {
      //   global.logger.info(`Received result for job ${job.id}`);
      // });

      // job.on('failed', (error) => {
      //   global.logger.error(`OrderJob::findShipperForOrder::failed id = ${job.id} -- ${error}`);
      // }
      // );

      return order;

    } catch (error) {
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

    const account = await Accounts.findOne({ _id: context.user._id });

    // check has order receiving
    const shipper = await Shipper.findOne({ account: account._id });
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

    // update status shipper
    await Shipper.findOneAndUpdate({ accountId: account._id }, { isReceiveOrder: true }, { new: true });

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

    return orders[0];
  },

  pickUpOrder: async (path, args, context, info) => {
    global.logger.info('orderQuery::pickUpOrder' + JSON.stringify(args));

    const { orderId } = args;

    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const shipper = await Shipper.findOne({ account: account._id });

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }


    if (order.shipperId !== shipper._id) {
      throw new Error('Đơn hàng này không thuộc về bạn');
    }

    // update status order
    await Order.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'Shipping', pickedUpAt: new Date() });

    return true;
  },

  completeShippingOrder: async (path, args, context, info) => {
    global.logger.info('orderQuery::completeShippingOrder' + JSON.stringify(args));

    const { orderId } = args;

    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const shipper = await Shipper.findOne({ account: account._id });

    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.orderStatus !== 'Shipping') {
      throw new Error('Đơn hàng này không thể chấp nhận');
    }

    if (order.shipperId !== shipper._id) {
      throw new Error('Đơn hàng này không thuộc về bạn');
    }

    // update status order
    await Order.findByIdAndUpdate({ _id: orderId }, { orderStatus: 'Delivered', deliveredAt: new Date() });

    return true;
  },


};


export default orderMutation;