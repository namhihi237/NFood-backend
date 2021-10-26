import { model, Schema } from 'mongoose';

const ShipperSchema = new Schema(
  {
    accountId: {
      type: model.Types.ObjectId,
      ref: 'Account',
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
    money: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

export default model('shipper', ShipperSchema, 'shipper');