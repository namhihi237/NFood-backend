import { model, Schema } from 'mongoose';

const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['admin', 'mod'],
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model('admin', AdminSchema, 'admin');