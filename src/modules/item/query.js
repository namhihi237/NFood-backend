import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item } from "../../models";

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

    return await Item.find({ vendorId: vendor.id });
  }
};


export default itemQuery;