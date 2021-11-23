import { model, Schema } from 'mongoose';

const CodeResets = new Schema(
  {
    phoneNumber: {
      type: String,
      require: true
    },
    code: {
      type: String,
      require: true
    },
    expireAt: {
      type: Date,
      default: Date.now,
      createIndexes: { expires: '2m' },
    },
  },
  { timestamps: true },
);

export default model('codeReset', CodeResets, 'codeReset');