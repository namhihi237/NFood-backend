import mongoose from 'mongoose';

const BuyerSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    name: {
      type: String,
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
    numberOfNotifications: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

// create index 2dsphere for location
BuyerSchema.index({ location: '2dsphere' });

export default mongoose.model('buyer', BuyerSchema, 'buyer');