import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    }
  },
  { timestamps: true }
);

// create index search index for name
CategorySchema.index({ name: 'text' });
export default mongoose.model('category', CategorySchema, 'category');