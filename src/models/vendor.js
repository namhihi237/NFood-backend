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
          enum: ['2', '3', '4', '5', '6', '7', '8'],
        },
        openTime: {
          type: Number,
        },
        closeTime: {
          type: Number,
        },
        isOpen: {
          type: Boolean,
          default: true,
        }
      }],
    },
    numberOfNotifications: {
      type: Number,
      default: 0,
    },
    isReceiveOrder: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true },
);

// create index 2dsphere for location
VendorSchema.index({ location: '2dsphere' });

// create index search index for name
VendorSchema.index({ name: 'text' });

export default mongoose.model('vendor', VendorSchema, 'vendor');