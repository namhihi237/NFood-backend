import { model, Schema } from 'mongoose';

const Notification = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    image: {
      type: String,
    },
    type: {
      type: String,
    },
    userType: {
      type: String,
      enum: ['buyer', 'vendor', 'shipper'],
      required: true
    }
  },
  { timestamps: true },
);

export default model('notification', Notification, 'notification');