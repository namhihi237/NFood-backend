import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Review, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';

const reviewQuery = {
  getReviews: async (parent, args, context, info) => {
    global.logger.info('reviewQuery.getReviews' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    let reviews = [];
    let reviewedId = null;
    if (args.type === 'vendor') {
      const vendor = await Vendor.findOne({ accountId: context.user.id });

      if (!vendor) {
        throw new Error('Bạn chưa là thông tin cửa hàng');
      }

      reviewedId = vendor._id;

    } else if (args.type === 'shipper') {
      const shipper = await Shipper.findOne({ accountId: context.user.id });

      if (!shipper) {
        throw new Error('Bạn chưa là shipper');
      }

      reviewedId = shipper._id;
    }

    if (reviewedId) {
      reviews = await Review.find({ reviewedId: reviewedId });

      reviews = reviews.map(async (review) => {
        const buyer = await Buyer.findOne({ _id: review.buyerId });
        review.buyer = buyer;
        return review;
      });
    }

    return reviews;
  }
};

export default reviewQuery;