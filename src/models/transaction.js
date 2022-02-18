import { model, Schema } from 'mongoose';

const Transaction = new Schema(
  {
    userId: {
      type: String,
    },
    userType: {
      type: String,
    },
    amount: {
      type: Number,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'payment'],
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
    },
    currency: {
      type: String,
    },
    fee: {
      type: Number,
    },
    bank: {
      type: {
        accountNumber: {
          type: String,
        },
        bankName: {
          type: String,
        },
        accountName: {
          type: String,
        },
      }
    }
  },
  { timestamps: true },
);

export default model('transaction', Transaction, 'transaction');