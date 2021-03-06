import mongoose from 'mongoose';

const BuyerSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female']
    },
    birthday: {
      type: Date,
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
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    bank: {
      type: {
        accountNumber: {
          type: String,
        },
        bankName: {
          type: String,
        },
        accountName: {
          type: String,
        },
      }
    }
  },
  { timestamps: true }
);

// create index 2dsphere for location
BuyerSchema.index({ location: '2dsphere' });

export default mongoose.model('buyer', BuyerSchema, 'buyer');