import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, VendorFavorite, Buyer, Vendor, Shipper } from "../../models";

import _ from 'lodash';

const bankMutation = {
  addBankAccount: async (parent, args, context, info) => {
    global.logger.info('bankMutation.addBankAccount', JSON.stringify(args));

    let { type, accountNumber, accountName, } = args;

    // check login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    if (type === 'shipper') {
      await Shipper.findOneAndUpdate({ accountId: context.user.id }, { $set: { bank: { accountNumber, accountName, bankName } } });
    } else if (type === 'buyer') {
      await Buyer.findOneAndUpdate({ accountId: context.user.id }, { $set: { bank: { accountNumber, accountName, bankName } } });
    } else if (type === 'vendor') {
      await Vendor.findOneAndUpdate({ accountId: context.user.id }, { $set: { bank: { accountNumber, accountName, bankName } } });
    }

    return true;
  }
}

export default bankMutation;