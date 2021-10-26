import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema(
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

// create index 2dsphere for location
VendorSchema.index({ location: '2dsphere' });

export default mongoose.model('vendor', VendorSchema, 'vendor');