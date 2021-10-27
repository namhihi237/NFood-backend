import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category } from "../../models";

import _ from 'lodash';

const categoryMutation = {
  createCategory: async (parent, args, context, info) => {
    global.logger.info('=======categoryMutation::createCategory=======');

    const { name } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check role is vendor
    if (!context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    if (!name) {
      throw new Error('Nhập tên danh mục');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    if (!vendor) {
      throw new Error('Bạn chưa mở cửa hàng');
    }

    // check if category exists
    let isExists = await Category.findOne({ name, vendorId: vendor.id });
    if (isExists) {
      throw new Error('Danh mục đã tồn tại');
    }

    const category = await Category.create({ name, vendorId: vendor.id });

    return category;
  },

  toggleCategory: async (parent, args, context, info) => {
    global.logger.info('=======categoryMutation::toggleCategory=======');

    const { id } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }
    console.log('context.user', context.user);

    // check role is vendor
    if (!context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    // check if category exists
    let isExists = await Category.findOne({ _id: id, vendorId: vendor.id });
    if (!isExists) {
      throw new Error('Danh mục không tồn tại');
    }

    const category = await Category.findByIdAndUpdate(id, { isActive: !isExists.isActive });

    return !category.isActive;
  },

  updateCategory: async (parent, args, context, info) => {
    global.logger.info('=======categoryMutation::updateCategory=======');

    const { id, name } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check role is vendor
    if (!context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    // check if category exists
    let isExists = await Category.findOne({ _id: id, vendorId: vendor.id });
    if (!isExists) {
      throw new Error('Danh mục không tồn tại');
    }

    await Category.findByIdAndUpdate(id, { name });

    return true;
  },

  deleteCategory: async (parent, args, context, info) => {
    global.logger.info('=======categoryMutation::deleteCategory=======');

    const { id } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check role is vendor
    if (!context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    let vendor = await Vendor.findOne({ accountId: context.user.id });

    // check if category exists
    let isExists = await Category.findOne({ _id: id, vendorId: vendor.id });
    if (!isExists) {
      throw new Error('Danh mục không tồn tại');
    }

    await Category.findByIdAndDelete(id);

    return true;
  }
};
export default categoryMutation;