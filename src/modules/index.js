import { authenticationMutation, authenticationQuery } from './authentication';
import { buyerMutation, buyerQuery } from './buyer';
import { vendorMutation, vendorQuery } from './vendor';
import { ImageQuery } from './image';
import { categoryMutation, categoryQuery, Category } from './category';
import { itemQuery, itemMutation } from './item';
import { Cart, cartMutation, cartQuery } from "./cart";
export default {
  Category,
  Cart,

  Query: {
    ...ImageQuery,
    ...categoryQuery,
    ...itemQuery,
    ...authenticationQuery,
    ...vendorQuery,
    ...cartQuery
  },

  Mutation: {
    ...authenticationMutation,
    ...buyerMutation,
    ...vendorMutation,
    ...categoryMutation,
    ...itemMutation,
    ...cartMutation
  }
};
