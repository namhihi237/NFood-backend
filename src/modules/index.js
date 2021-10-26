import { authenticationMutation } from './authentication';
import { buyerMutation } from './buyer';
import { vendorMutation } from './vendor';

export default {

  Query: {

  },

  Mutation: {
    ...authenticationMutation,
    ...buyerMutation,
    ...vendorMutation
  }
};
