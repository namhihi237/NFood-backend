import { model, Schema } from 'mongoose';

const AccountSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      require: true
    },
    password: {
      type: String,
      require: true
    },
    role: [{
      type: String,
      enum: ['buyer', 'shipper', 'vendor'],
      required: true
    }],
    isActive: {
      type: Boolean,
      default: false
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    googleId: {
      type: String
    },
    isBuyer: {
      type: Boolean,
      default: false
    },
    isShipper: {
      type: Boolean,
      default: false
    },
    isVendor: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default model('account', AccountSchema, 'account');