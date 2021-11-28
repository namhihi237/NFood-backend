import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Order, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import { constants } from "../../configs";
import orderService from "./orderService";

const orderSubscribe = {
  orderShipping: {
    subscribe: (parent, args, { pubsub, user }) => {
      return pubsub.asyncIterator(`ORDER_SHIPPING_${user._id}`);
    }
  },
};

export default orderSubscribe;