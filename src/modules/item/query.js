import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import mongoose from 'mongoose';

import _ from 'lodash';

const itemQuery = {
  getAllItem: async (root, args, context, info) => {
    global.logger.info('itemQuery::getAllItems');

    const { user } = context;

    // check login
    if (!user) {
      throw new Error('Bạn chưa dăng nhập');
    }

    const vendor = await Vendor.findOne({ accountId: user.id });

    if (!vendor) {
      throw new Error('Bạn chưa có cửa hàng');
    }

    let a = await Item.aggregate([
      {
        $match: {
          vendorId: mongoose.Types.ObjectId(vendor._id)
        },
      },
      {
        $lookup: {
          from: 'category',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
    ]); 

    a = JSON.parse(JSON.stringify(a));

    console.log(a);

    return a;
  }
};


export default itemQuery;