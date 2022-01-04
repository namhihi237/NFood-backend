import { model, Schema } from 'mongoose';

const ReviewVoucher = new Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    reviewedId: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['item', 'vendor', 'shipper'],
    }
  },
  { timestamps: true },
);

export default model('review', ReviewVoucher, 'review');