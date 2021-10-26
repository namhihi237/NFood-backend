import { model, Schema } from 'mongoose';

const BuyerSchema = new Schema(
  {
    accountId: {
      type: model.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    image: {
      type: String,
    },
    point: {
      type: Number,
      default: 0,
    },
    money: {
      type: Number,
      default: 0,
    },
    promoCode: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model('buyer', BuyerSchema, 'buyer');