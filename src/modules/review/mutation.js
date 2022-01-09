import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Review, Buyer, Vendor, Shipper, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';

const reviewMutation = {
  addReview: async (parent, args, context, info) => {
    global.logger.info('reviewMutation.addReview' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const buyer = await Buyer.findOne({ accountId: context.user.id });

    if (!buyer) {
      throw new Error('Bạn chưa đăng nhập');
    }

    if (args.type === 'vendor') {
      const vendor = await Vendor.findOne({ _id: args.reviewedId });

      if (!vendor) {
        throw new Error('Không tìm thấy cửa hàng này');
      }
    } else if (args.type === 'shipper') {
      const shipper = await Shipper.findOne({ _id: args.reviewedId });

      if (!shipper) {
        throw new Error('Không tìm thấy nhân viên này');
      }
    } else if (args.type === 'item') {
      const item = await Item.findOne({ _id: args.reviewedId });

      if (!item) {
        throw new Error('Không tìm thấy sản phẩm này');
      }
    }

    const order = await Order.findOne({ _id: args.orderId });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng này');
    }

    if (args.type === 'vendor') {
      if (vendor.isReviewVendor) {
        throw new Error('Bạn đã đánh giá cửa hàng này rồi');
      }
    } else if (args.type === 'shipper') {
      if (shipper.isReviewShipper) {
        throw new Error('Bạn đã đánh giá nhân viên này rồi');
      }
    }

    // validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error('Đánh giá phải từ 1 đến 5');
    }

    await Review.create({
      ...args,
      buyerId: context.user.id,
    });

    // update isReviewVendor or isReviewShipper
    if (args.type === 'vendor') {
      await Order.updateOne({ _id: args.orderId }, { $set: { isReviewVendor: true } });
    } else if (args.type === 'shipper') {
      await Order.updateOne({ _id: args.orderId }, { $set: { isReviewShipper: true } });
    }

    return true;
  },
};

export default reviewMutation;