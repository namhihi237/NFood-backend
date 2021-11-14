import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart } from "../../models";
import mongoose from "mongoose";

import _ from 'lodash';

const cartQuery = {
  carts: async (parent, args, context, info) => {
    global.logger.info('cartQuery::carts---' + JSON.stringify(args));

    // check login 
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // get cart items
    const carts = await Cart.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(context.user._id),
        }
      },
      {
        $lookup: {
          from: 'item',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item'
        }
      },
      {
        $unwind: {
          path: '$item',
          preserveNullAndEmptyArrays: true
        }
      },
      // check item.isActive == true
      {
        $match: {
          'item.isActive': true
        }
      },
    ]);

    return carts;
  }

};
export default cartQuery;