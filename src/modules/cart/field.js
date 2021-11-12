import moment from "moment";
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item, Cart } from "../../models";

const CartItem = {
  // Item fields
  item: async (parent, args, context) => {
    if (!parent.itemId) return null;
    return Item.findOne({ _id: parent.itemId });
  },

  createdAt: (parent, args, context) => {
    if (!parent.createdAt) return null;
    return moment(parent.createdAt).format('YYYY-MM-DD HH:mm:ss');
  },

}

export default CartItem;