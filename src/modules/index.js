import { authenticationMutation } from './authentication';
import { buyerMutation } from './buyer';
import { vendorMutation } from './vendor';
import { ImageQuery } from './image';

export default {

  Query: {
    ...ImageQuery
  },

  Mutation: {
    ...authenticationMutation,
    ...buyerMutation,
    ...vendorMutation
  }
};
