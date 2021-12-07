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
    }
  },
  { timestamps: true },
);

export default model('notification', Notification, 'notification');