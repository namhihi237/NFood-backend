import { authenticationMutation } from './authentication';
import { buyerMutation } from './buyer';
import { vendorMutation } from './vendor';
import { ImageQuery } from './image';
import { categoryMutation, categoryQuery } from './category';

export default {

  Query: {
    ...ImageQuery,
    ...categoryQuery,
  },

  Mutation: {
    ...authenticationMutation,
    ...buyerMutation,
    ...vendorMutation,
    ...categoryMutation
  }
};
