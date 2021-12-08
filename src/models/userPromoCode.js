import { model, Schema } from 'mongoose';

const UserVoucher = new Schema(
  {
    promoCode: {
      type: String,
    },
    voucherId: {
      type: String,
    },
    buyerId: {
      type: String,
    },
  },
  { timestamps: true },
);

export default model('userVoucher', UserVoucher, 'userVoucher');