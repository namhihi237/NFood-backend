import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';

const itemMutation = {
  createItem: async (root, args, context, info) => {
    global.logger.info('=========itemMutation::createItem========' + JSON.stringify(args));

    let { name, description, image, categoryId, price } = args;

    // check required fields
    if (!name || !image || !price || !categoryId) {
      throw new Error('Vui lòng nhập đủ thông tin');
    }

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check role is vendor
    if (!context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }
    const vendor = await Vendor.findOne({ accountId: context.user.id });

    // check vendor
    if (!vendor) {
      throw new Error('Bạn chưa mở cửa hàng');
    }
    // check name exist
    let item = await Item.findOne({ name, vendorId: vendor._id });

    if (item) {
      throw new Error('Sản phẩm đã tồn tại');
    }

    // check category exist
    let category = await Category.findOne({ id: categoryId });

    if (!category) {
      throw new Error('Danh mục không tồn tại');
    }

    // create item
    return Item.create({ name, price, description, image, vendorId: vendor._id, categoryId });

  },

  toggleItemStatus: async (root, args, context, info) => {
    global.logger.info('=========itemMutation::toggleItemStatus========', JSON.stringify(args));

    let { id } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check role is vendor
    if (!context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    // check item exist
    let item = await Item.findOne({ id });

    if (!item) {
      throw new Error('Sản phẩm không tồn tại');
    }

    const vendor = await Vendor.findOne({ accountId: context.user.id });

    // check vendor
    if (JSON.stringify(item.vendorId) != JSON.stringify(vendor._id)) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    await Item.findByIdAndUpdate(id, { isActive: !item.isActive });

    return !item.isActive;
  },


  deleteItem: async (root, args, context, info) => {
    global.logger.info('=========itemMutation::deleteItem========', JSON.stringify(args));

    let { id } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check item status
    let item = await Item.findOne({ id });

    if (!item) {
      throw new Error('Sản phẩm không tồn tại');
    }

    // check vendor
    const vendor = await Vendor.findOne({ accountId: context.user.id });

    if (JSON.stringify(item.vendorId) != JSON.stringify(vendor._id)) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    await Item.findByIdAndDelete(id);

    return true;

  },

  // update item
  updateItem: async (root, args, context, info) => {
    global.logger.info('=========itemMutation::updateItem========' + JSON.stringify(args));

    let { id, name } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check id valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Sản phẩm không tồn tại');
    }

    // check item exist
    let item = await Item.findById(id);

    if (!item) {
      throw new Error('Sản phẩm không tồn tại');
    }

    // check vendor
    const vendor = await Vendor.findOne({ accountId: context.user.id });

    if (JSON.stringify(item.vendorId) != JSON.stringify(vendor._id)) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    // check name exist
    let itemExist = await Item.findOne({ name, vendorId: vendor._id });

    if (itemExist && itemExist._id != id) {
      throw new Error('Sản phẩm đã tồn tại');
    }

    // check category exist
    // let category = await Category.findById(categoryId);

    // if (!category) {
    //   throw new Error('Danh mục không tồn tại');
    // }

    console.log(args);
    // delete attribute empty string
    for (let key in args) {
      if (!args[key] && key != "description") {
        delete args[key];
      }
    }
    console.log(args);

    // update item
    await Item.findByIdAndUpdate(id, args);

    return Item.findById(id);
  }
};

export default itemMutation;