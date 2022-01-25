import { model, Schema } from 'mongoose';

const Transaction = new Schema(
  {
    userId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw'],
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
    },
    currency: {
      type: String,
    }
  },
  { timestamps: true },
);

export default model('transaction', Transaction, 'transaction');