import { gql } from 'apollo-server-express';

export default gql`
  type User {
    id: ID!
    email: String!
    fullName: String!
    phoneNumber: String
    image: String
    role: [String]
    point: Int
    address: String
    promoCode: String
  }

  type Query {
    getUser: User
  }
 
 
  type Mutation {
    register(phoneNumber: String!, password: String!, role: roleEnum!): User!
    activePhoneNumber(phoneNumber: String!, code: String!): JWTResponse!
    login(phoneNumber: String!, password: String!): JWTResponse!
    getCodePhoneNumber(phoneNumber: String!): Boolean!
    activeCodeReset(phoneNumber: String!, code: String!): Boolean!
  }

  type JWTResponse {
    user: User!
    token: String!
  }

  enum roleEnum {
    buyer
    shipper
    vendor
  }
`;
