import { model, Schema } from 'mongoose';

const Voucher = new Schema(
  {
    promoCode: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
    },
    discountType: {
      type: String,
      enum: ['PERCENT', 'FIXED'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: true,
    },
    minTotal: {
      type: Number,
    },
    maxDiscount: {
      type: Number,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    quantity: {
      type: Number,
    }
  },
  { timestamps: true },
);

export default model('voucher', Voucher, 'voucher');