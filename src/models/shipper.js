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
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female']
    },
    identityCard: {
      number: {
        type: String,
      },
      date: {
        type: Date,
      },
      place: {
        type: String,
      },
      beforeImage: {
        type: String,
      },
      afterImage: {
        type: String,
      }
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
      default: 0.5,
    },
    numberOfNotifications: {
      type: Number,
      default: 0,
    },
    currentOrderId: {
      type: mongoose.Types.ObjectId,
      ref: 'Order',
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
ShipperSchema.index({ location: '2dsphere' });

export default mongoose.model('shipper', ShipperSchema, 'shipper');