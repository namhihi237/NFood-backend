import { authenticationMutation, authenticationQuery } from './authentication';
import { buyerMutation, buyerQuery } from './buyer';
import { vendorMutation, vendorQuery, TimeOpen } from './vendor';
import { ImageQuery } from './image';
import { categoryMutation, categoryQuery, Category } from './category';
import { itemQuery, itemMutation } from './item';
import { Cart, cartMutation, cartQuery } from "./cart";
import { orderMutation, orderQuery, orderSubscribe, Order } from "./order";
import { shipperMutation, shipperQuery } from './shipper';
import { notificationQuery, notificationSubscribe, notificationMutation } from "./notification";
import { voucherMutation, voucherQuery } from "./voucher";
import { reviewMutation, reviewQuery } from './review';
import { transactionQuery } from './transaction';
import { bankMutation, bankQuery } from './bank';

export default {
  Category,
  Cart,
  Order,
  TimeOpen,

  Query: {
    ...ImageQuery,
    ...categoryQuery,
    ...itemQuery,
    ...authenticationQuery,
    ...vendorQuery,
    ...cartQuery,
    ...orderQuery,
    ...notificationQuery,
    ...voucherQuery,
    ...shipperQuery,
    ...buyerQuery,
    ...reviewQuery,
    ...transactionQuery,
    ...bankQuery
  },

  Mutation: {
    ...authenticationMutation,
    ...buyerMutation,
    ...vendorMutation,
    ...categoryMutation,
    ...itemMutation,
    ...cartMutation,
    ...orderMutation,
    ...shipperMutation,
    ...notificationMutation,
    ...voucherMutation,
    ...reviewMutation,
    ...bankMutation,
  },

  Subscription: {
    ...orderSubscribe,
    ...notificationSubscribe
  },
};
