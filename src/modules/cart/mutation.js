import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart } from "../../models";
import mongoose from "mongoose";

import _ from 'lodash';

const cartMutation = {
  addToCart: async (path, args, context, info) => {
    global.logger.info('cartMutation::addToCart---' + JSON.stringify(args));

    // check login  
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check item exist
    let item = await Item.findOne({ _id: args.itemId, isActive: true });

    if (!item) {
      throw new Error('Món ăn này hiện không có, vui lòng chọn món khác');
    }

    // check item has include vendor current
    const check = await Cart.count({ vendorId: args.vendorId });

    let cart;


    if (check > 0) {
      // check item há been added to cart list then update quantity
      cart = await Cart.findOne({ userId: context.user.id, itemId: args.itemId, vendorId: args.vendorId });

      if (cart) {
        const quantity = cart.quantity + args.quantity;
        const note = args.note;
        cart = await Cart.findOneAndUpdate({ _id: cart._id }, { quantity, note }, { new: true });
      } else {
        cart = await Cart.create({ userId: context.user.id, itemId: args.itemId, quantity: args.quantity, vendorId: args.vendorId, note: args.note });
      }

    } else {
      // delete all cart of old vendor
      await Cart.deleteMany({ userId: context.user.id });

      // create new cart
      cart = await Cart.create({ userId: context.user.id, itemId: args.itemId, quantity: args.quantity, vendorId: args.vendorId, note: args.note });
    }

    return cart;
  },

  removeFromCart: async (path, args, context, info) => {
    global.logger.info('cartMutation::removeFromCart---' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check item exist in cart
    let cart = await Cart.findOne({ _id: args.id, userId: context.user.id });

    if (!cart) {
      throw new Error('Không tim thấy món trong giỏ hàng');
    }

    // remove item from cart
    await Cart.findByIdAndRemove(cart._id);

    return true;
  },

  updateQuantityInCart: async (path, args, context, info) => {
    global.logger.info('cartMutation::updateQuantityInCart---' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check item exist in cart
    let cart = await Cart.findOne({ _id: args.id, userId: context.user.id });

    if (!cart) {
      throw new Error('Không tim thấy món trong giỏ hàng');
    }

    // update quantity

    cart = await Cart.findOneAndUpdate({ _id: cart._id }, { quantity: args.quantity }, { new: true });

    return cart;


  }
};
export default cartMutation;