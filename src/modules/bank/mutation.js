import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, VendorFavorite, Buyer, Vendor, Shipper, Transaction } from "../../models";

import _ from 'lodash';

const bankMutation = {
  addBankAccount: async (parent, args, context, info) => {
    global.logger.info('bankMutation.addBankAccount', JSON.stringify(args));

    let { type, accountNumber, accountName, bankName } = args;

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

    let user = null;
    if (type === 'shipper') {
      user = await Shipper.findOne({ accountId: context.user.id });
      if (!user) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (!user.bank.accountNumber) {
        throw new Error('Vui lòng thêm thông tin tài khoản ngân hàng');
      }

      if (user.money < amount) {
        throw new Error('Số tiền trong tài khoản không đủ để thực hiện giao dịch');
      }

      await Shipper.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: -amount } });

    } else if (type === 'buyer') {
      user = await Buyer.findOne({ accountId: context.user.id });

      if (!user) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (!user.bank.accountNumber) {
        throw new Error('Vui lòng thêm thông tin tài khoản ngân hàng');
      }

      if (user.money < amount) {
        throw new Error('Số tiền trong tài khoản không đủ để thực hiện giao dịch');
      }

      await Buyer.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: -amount } });

    } else if (type === 'vendor') {
      user = await Vendor.findOne({ accountId: context.user.id });

      if (!user) {
        throw new Error('Tài khoản không tồn tại');
      }

      if (!user.bank.accountNumber) {
        throw new Error('Vui lòng thêm thông tin tài khoản ngân hàng');
      }

      if (user.money < amount) {
        throw new Error('Số tiền trong tài khoản không đủ để thực hiện giao dịch');
      }

      await Vendor.findOneAndUpdate({ accountId: context.user.id }, { $inc: { money: -amount } });
    }

    // create the transaction 
    await Transaction.create({
      userId: user._id,
      amount,
      type: 'withdraw',
      status: 'pending',
      bank: user.bank
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