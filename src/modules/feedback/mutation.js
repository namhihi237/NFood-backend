import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Feedback, Buyer, Vendor, Shipper } from "../../models";
import mongoose from "mongoose";

import _ from 'lodash';

const feedbackMutation = {
  addFeedback: async (path, args, context, info) => {
    global.logger.info('feedbackMutation::addFeedback---' + JSON.stringify(args));

    // check login  
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }
    const { type, message } = args;

    let user = null;

    if (type === 'buyer') {
      user = await Buyer.findOne({ accountId: context.user.id });
    } else if (type === 'shipper') {
      user = await Shipper.findOne({ accountId: context.user.id });
    } else if (type === 'vendor') {
      user = await Vendor.findOne({ accountId: context.user.id });
    }

    // create a new feedback
    await Feedback.create({
      userId: user._id,
      userType: type,
      message
    });

    return true;

  },


};
export default feedbackMutation;