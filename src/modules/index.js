import { authenticationMutation } from './authentication';
import { buyerMutation } from './buyer';
import { vendorMutation } from './vendor';
import { ImageQuery } from './image';
import { categoryMutation, categoryQuery } from './category';
import { itemQuery, itemMutation } from './item';

export default {

  Query: {
    ...ImageQuery,
    ...categoryQuery,
    ...itemQuery
  },

  Mutation: {
    ...authenticationMutation,
    ...buyerMutation,
    ...vendorMutation,
    ...categoryMutation,
    ...itemMutation
  }
};
