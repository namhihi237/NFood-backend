import { Buyer, Vendor, Shipper, Transaction } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';

const transactionQuery = {
  getTransactions: async (parent, args, context, info) => {
    global.logger.info('transactionQuery::getTransactions' + JSON.stringify(args));

    const { type } = args;
    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    let user;
    if (type === 'shipper') {
      user = await Shipper.findOne({ accountId: context.user.id });
    } else if (type === 'buyer') {
      user = await Buyer.findOne({ accountId: context.user.id });
    }

    if (!user) {
      throw new Error('Not found');
    }

    const transactions = await Transaction.find({
      userId: user._id
    });

    return transactions;
  }
}


export default transactionQuery;