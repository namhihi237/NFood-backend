import { model, Schema } from 'mongoose';

const Notification = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    image: {
      type: String,
    },
    type: {
      type: String,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    userType: {
      type: String,
      enum: ['buyer', 'shipper', 'vendor'],
    }
  },
  { timestamps: true },
);

export default model('notification', Notification, 'notification');