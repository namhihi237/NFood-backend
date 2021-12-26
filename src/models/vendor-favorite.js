import { model, Schema } from 'mongoose';

const VendorFavorites = new Schema(
  {
    vendorId: {
      type: String,
    },
    buyerId: {
      type: String,
    },
  },
  { timestamps: true },
);

export default model('vendorFavorite', VendorFavorites, 'vendorFavorite');