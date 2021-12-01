import mongoose from 'mongoose';

const ShipperSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Types.ObjectId,
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
    },
    isShippingOrder: {
      type: Boolean,
      default: false,
    },
    isReceiveOrder: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    maxReceiveOrderDistance: {
      type: Number,
      default: 10,
    }
  },
  { timestamps: true }
);
// create index 2dsphere for location
ShipperSchema.index({ location: '2dsphere' });

export default mongoose.model('shipper', ShipperSchema, 'shipper');