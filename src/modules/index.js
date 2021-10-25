import { authenticationMutation } from './authentication';


export default {

  Query: {
   
  },

  Mutation: {
    ...authenticationMutation,
  }
};
