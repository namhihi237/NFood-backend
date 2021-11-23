import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';

const LIMIT_DISTANCE_FREE_SHIPPING = 2; //km

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
      let shipping = 0;

      // calculate discount
      let discount = 0;

      // calculate total price
      let total = subTotal + shipping - discount;

      // calculate delivery time base on distance
      let now = new Date();
      let deliveryDate = new Date(now.getTime() + (5 * 1000));


      let orderItems = [];
      cartItems.forEach(cartItem => {
        orderItems.push({
          itemId: cartItem.item._id,
          buyerId: buyer._id,
          name: buyer.name,
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
          deliveryDate,
          orderItems,
        }], { session });

        order = order[0];

      } else if (method === 'ONLINE') {
        // no implement yet
      }

      await Cart.deleteMany({ userId: account._id }, { session });

      await session.commitTransaction();
      session.endSession();

      return order;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
};

// generate invoice number from order
const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;


  // get last order
  const lastOrder = await Order.findOne({}).sort({ createdAt: -1 });
  let invoiceNumber = null;
  if (!lastOrder) {
    return `${year}${month}-${'1'.startsWith(4)}`;
  }

  const lastInvoiceNumber = lastOrder.invoiceNumber;
  const lastInvoiceNumberSplit = lastInvoiceNumber.split('-');
  const lastInvoiceNumberYear = lastInvoiceNumberSplit[0];
  const lastInvoiceNumberMonth = lastInvoiceNumberSplit[1];
  const lastInvoiceNumberNumber = lastInvoiceNumberSplit[2];

  // increment invoice number by lastInvoiceNumber
  if (lastInvoiceNumberYear === year && lastInvoiceNumberMonth === month) {
    invoiceNumber = `${year}${month}-${(parseInt(lastInvoiceNumberNumber) + 1).startsWith(4)}`;
  } else {
    invoiceNumber = `${year}${month}-${'1'.startsWith(4)}`;
  }
  return invoiceNumber;
};

export default orderMutation;