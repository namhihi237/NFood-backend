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
  },

  requestWithdraw: async (parent, args, context, info) => {
    global.logger.info('bankMutation.requestWithdraw', JSON.stringify(args));

    let { amount, type } = args;

    // check login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    // check amount
    if (amount <= 0) {
      throw new Error('Số tiền rút không hợp lệ');
    }

    let userId = null;
    if (type === 'shipper') {
      const shipper = await Shipper.findOne({ accountId: context.user.id });
      if (!shipper) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (!shipper.bank.accountNumber) {
        throw new Error('Vui lòng thêm thông tin tài khoản ngân hàng');
      }

      if (shipper.money < amount) {
        throw new Error('Số tiền trong tài khoản không đủ để thực hiện giao dịch');
      }

      userId = shipper._id;

      await Shipper.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: -amount } });

    } else if (type === 'buyer') {
      const buyer = await Buyer.findOne({ accountId: context.user.id });

      if (!buyer) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (!buyer.bank.accountNumber) {
        throw new Error('Vui lòng thêm thông tin tài khoản ngân hàng');
      }

      if (buyer.money < amount) {
        throw new Error('Số tiền trong tài khoản không đủ để thực hiện giao dịch');
      }

      // create requestWithdraw
      userId = buyer._id;

      await Buyer.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: -amount } });

    } else if (type === 'vendor') {
      const vendor = await Vendor.findOne({ accountId: context.user.id });

      if (!vendor) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (!vendor.bank.accountNumber) {
        throw new Error('Vui lòng thêm thông tin tài khoản ngân hàng');
      }

      if (vendor.money < amount) {
        throw new Error('Số tiền trong tài khoản không đủ để thực hiện giao dịch');
      }

      userId = vendor._id;
      await Vendor.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: -amount } });
    }

    // create the transaction 
    await Transaction.create({
      userId,
      amount,
      type: 'withdraw',
      status: 'pending',
    });

    return true;
  },

  confirmWithdraw: async (parent, args, context, info) => {
    throw new Error('Chức năng này đang được cập nhật');
  },
}


async function calculateAmountPending(userId) {
  let amount = 0;
  const transactions = await Transaction.find({ userId, type: 'withdraw', status: 'pending' });
  for (let i = 0; i < transactions.length; i++) {
    amount += transactions[i].amount;
  }

  return amount;
}

export default bankMutation;