import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import mongoose from 'mongoose';

import _ from 'lodash';

const authenticationQuery = {
  getUser: async (parent, args, context, info) => {
    global.logger.info('getUser' + JSON.stringify(args));

    let { role } = args;
    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // find accounr by id
    let account = await Accounts.findById(context.user.id);

    if (!account) {
      throw new Error('Tài khoản không tồn tại');
    }

    account = JSON.parse(JSON.stringify(account));

    logger.info('account: ' + JSON.stringify(account));

    // get info user by role
    let user = null;
    if (account.role.includes('buyer') && role === 'buyer') {
      user = await Buyer.findOne({ accountId: account._id });
    } else if (account.role.includes('vendor') && role === 'vendor') {
      user = await Vendor.findOne({ accountId: account._id });
    } else if (account.role.includes('shipper') && role === 'shipper') {
      user = await Shipper.findOne({ accountId: account._id });
    }
    logger.info('user: ' + JSON.stringify(user));

    return {
      ..._.pick(account, ['_id', 'isVendor', 'isShipper', 'isBuyer', 'phoneNumber', 'role']),
      ..._.pick(user, ['_id', 'email', 'address', 'location.coordinates', 'name', 'image',]),
    };
  }
};


export default authenticationQuery;