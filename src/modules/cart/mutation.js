import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item , Cart} from "../../models";
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
    let item = await Item.findOne({_id: args.itemId, isActive: true});

    if (!item) {
      throw new Error('Món ăn này hiện không có, vui lòng chọn món khác');
    }

    // check item há been added to cart list then update quantity
    let cart = await Cart.findOne({userId: context.user.id, itemId: args.itemId});

    if (cart) {
      const quantity  = cart.quantity + args.quantity;
      cart = await Cart.findOneAndUpdate({_id: cart._id}, {quantity}, { new: true });
    } else {
      cart = await Cart.create({ userId: context.user.id, itemId: args.itemId, quantity: args.quantity });
    }

    return cart;
  }
};
export default cartMutation;