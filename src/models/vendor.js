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
    },
    timeOpen: {
      type: [{
        day: {
          type: String,
          enum: ['Thứ 2', 'Thứ 3', 'Thú 4', 'Thứ 5', 'Thú 6', 'Thú 7', 'Chủ nhật'],
        },
        open: {
          type: String,
        },
        close: {
          type: String,
        },
      }],
    },
  },
  { timestamps: true }
);

// create index 2dsphere for location
VendorSchema.index({ location: '2dsphere' });

export default mongoose.model('vendor', VendorSchema, 'vendor');