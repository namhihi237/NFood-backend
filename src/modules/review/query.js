import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Review, Buyer, Vendor, Shipper, Category, Item, Cart, Order } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
const BAD_REVIEW = 1;
const NORMAL_REVIEW = 2;
const GOOD_REVIEW = 3;

const reviewQuery = {
  getReviews: async (parent, args, context, info) => {
    global.logger.info('reviewQuery.getReviews' + JSON.stringify(args));

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    let reviews = [];
    let badReviews = 0, normalReviews = 0, goodReviews = 0;
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

      badReviews = await Review.count({ reviewedId: reviewedId, rating: BAD_REVIEW });
      normalReviews = await Review.count({ reviewedId: reviewedId, rating: NORMAL_REVIEW });
      goodReviews = await Review.count({ reviewedId: reviewedId, rating: GOOD_REVIEW });
    }

    return {
      reviews,
      badReviews,
      normalReviews,
      goodReviews
    };
  },

  getReviewsByVendor: async (parent, args, context, info) => {
    global.logger.info('reviewQuery.getReviewsByVendor' + JSON.stringify(args));

    const { vendorId } = args;

    let reviews = await Review.find({ reviewedId: vendorId });

    reviews = reviews.map(async (review) => {
      const buyer = await Buyer.findOne({ _id: review.buyerId });
      review.buyer = buyer;
      return review;
    });

    return {
      reviews
    };
  },

  updateReviewInit: async (parent, args, context, info) => { 
    // find all vendors
    const vendors = await Vendor.find({});

    // update number of reviews and rating of vendor
    vendors.forEach(async (vendor) => { 
      const numberOfReviews = await Review.countDocuments({ reviewedId: vendor._id });

      const rating = await Review.countDocuments({ reviewedId: vendor._id, rating: 3 });

      await Vendor.updateOne({ _id: vendor._id }, { numberOfReviews, rating });
    });

    return true;
  }
};

export default reviewQuery;