import { authenticationMutation, authenticationQuery } from './authentication';
import { buyerMutation } from './buyer';
import { vendorMutation } from './vendor';
import { ImageQuery } from './image';
import { categoryMutation, categoryQuery, Category } from './category';
import { itemQuery, itemMutation } from './item';

export default {
  Category,

  Query: {
    ...ImageQuery,
    ...categoryQuery,
    ...itemQuery,
    ...authenticationQuery,
  },

  Mutation: {
    ...authenticationMutation,
    ...buyerMutation,
    ...vendorMutation,
    ...categoryMutation,
    ...itemMutation
  }
};
