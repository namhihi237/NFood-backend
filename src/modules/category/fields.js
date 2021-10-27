import {Item } from "../../models";
import moment from "moment";

const Category = {
  items: async (_parent) => {
    if (!_parent._id) {
      return null;
    }
    return Item.find({ categoryId: _parent._id });
  }
}

export default Category;