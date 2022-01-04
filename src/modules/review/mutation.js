import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Review, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
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

    // validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error('Đánh giá phải từ 1 đến 5');
    }

    await Review.create({
      ...args,
      buyerId: context.user.id,
    });

    return true;
  },
};

export default reviewMutation;