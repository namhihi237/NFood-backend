import { authenticationMutation, authenticationQuery } from './authentication';
import { buyerMutation, buyerQuery } from './buyer';
import { vendorMutation, vendorQuery } from './vendor';
import { ImageQuery } from './image';
import { categoryMutation, categoryQuery, Category } from './category';
import { itemQuery, itemMutation } from './item';
import { Cart, cartMutation, cartQuery } from "./cart";
import { orderMutation, orderQuery, orderSubscribe, Order } from "./order";
import { shipperMutation } from './shipper';
import { notificationQuery, notificationSubscribe, notificationMutation } from "./notification";

export default {
  Category,
  Cart,
  Order,

  Query: {
    ...ImageQuery,
    ...categoryQuery,
    ...itemQuery,
    ...authenticationQuery,
    ...vendorQuery,
    ...cartQuery,
    ...orderQuery,
    ...notificationQuery
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
    ...notificationMutation
  },

  Subscription: {
    ...orderSubscribe,
    ...notificationSubscribe
  },
};
