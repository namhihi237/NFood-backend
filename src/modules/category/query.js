import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category } from "../../models";

import _ from 'lodash';

const categoryQuery = {
  getAllCategory: async (parent, args, context, info) => {
    global.logger.info('=======categoryQuery::getAllCategory=======');

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa đăng ký làm nhà cung cấp');
    }

    return Category.find({ vendorId: vendor.id });
  }
}

export default categoryQuery;