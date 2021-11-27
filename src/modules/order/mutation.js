import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
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

      const invoiceNumber = await generateInvoiceNumber();

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
        }], { session });

        order = order[0];

      } else if (method === 'ONLINE') {
        throw new Error('Not implemented')
      }

      await Cart.deleteMany({ userId: account._id }, { session });

      await session.commitTransaction();
      session.endSession();

      // pút notification to shipper to accept shipping order
      context.pubsub.publish('ORDER_SHIPPING', { orderShipping: order });

      return order;

    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  }
};

// generate invoice number from order
const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // invoice number format: YYYYMM-6[number or anphabet]
  let invoiceNumber = `${year}${month}-`;

  // random 6 number or anphabet
  const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  invoiceNumber += random;

  // check if invoice number is exist
  const order = await Order.findOne({ invoiceNumber });
  if (order) {
    return generateInvoiceNumber();
  }
  return invoiceNumber;
};

export default orderMutation;