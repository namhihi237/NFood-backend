import { model, Schema } from 'mongoose';

const Feedback = new Schema(
  {
    userId: {
      type: String,
      require: true
    },
    userType: {
      type: String,
    },
    message: {
      type: String,
    }
  },
  { timestamps: true },
);

export default model('feedback', Feedback, 'feedback');