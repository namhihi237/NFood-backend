import { gql } from 'apollo-server-express';

export default gql`
  type User {
    _id: ID!
    phoneNumber: String
    role: [String]
    address: String
    isVendor: Boolean
    isBuyer: Boolean
    isShipper: Boolean
  }

  type Category {
    _id: ID!
    name: String
    items: [Item]
  }

  type Item {
    _id: ID!
    name: String
    description: String
    category: Category
    image: String
    price: Int
    isActive: Boolean
  }

  type Query {
    getUser: User
    getSignatureImage: String!
    getAllCategory: [Category]!
    getAllItem: [Item]!
  }
 
  type Mutation {
    register(phoneNumber: String!, password: String!, role: roleEnum!): User!
    activePhoneNumber(phoneNumber: String!, code: String!): JWTResponse!
    login(phoneNumber: String!, password: String!): JWTResponse!
    getCodePhoneNumber(phoneNumber: String!): Boolean!
    activeCodeReset(phoneNumber: String!, code: String!): Boolean!
    setNameBuyer(name: String!): Response!
    activeVendor(name: String!, address: String!, image: String!): Response!
    createCategory(name: String!): Category!
    toggleCategory(id: ID!): Boolean!
    updateCategory(id: ID!, name: String!): Boolean!
    deleteCategory(id: ID!): Boolean!
    createItem(name: String!, price: Int!, image: String!, categoryId: ID!, description: String): Item!
    updateItem(id: ID!, name: String, price: Int, image: String, categoryId: ID, description: String): Item!
    deleteItem(id: ID!): Boolean!
    toggleItemStatus(id: ID!): Boolean!

  }

  type JWTResponse {
    user: User!
    token: String!
  }

  type Response {
    success: Boolean!
    message: String!
  }

  enum roleEnum {
    buyer
    shipper
    vendor
  }
  
`;
