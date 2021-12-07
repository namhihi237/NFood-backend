import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Order, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import { constants } from "../../configs";
import { withFilter } from 'graphql-subscriptions';

const notificationSubscribe = {
  numberOfNotifications: {
    subscribe: async (parent, args, { pubsub, user }) => {
      return pubsub.asyncIterator(`NUMBER_OF_NOTIFICATIONS_${user._id}_${args.userType}`);
    }
  }
};

export default notificationSubscribe;