import { gql } from 'apollo-server-express';

export default gql`
  type User {
    _id: ID!
    phoneNumber: String
    role: [String]
    name: String
    address: String
    image: String
    isVendor: Boolean
    isBuyer: Boolean
    isShipper: Boolean
    coordinates: [Float]
  }

  type Category {
    _id: ID!
    name: String
    isActive: Boolean
    items: [Item]
  }

  type Vendor {
    _id: ID!
    name: String
    phoneNumber: String
    rating: Float
    image: String
    distance: Float
    address: String
    numberOfReview: Int
    menu: [Category]
  }

  type resultVendor {
    items: [Vendor!]
    total: Int!
  }

  type Item {
    _id: ID!
    name: String
    description: String
    category: Category
    image: String
    price: Float
    isActive: Boolean
  }

  type Cart {
    _id: ID!
    item: Item
    quantity: Int
    createdAt: String
  }

  type Query {
    getUser(role: roleEnum!): User
    getSignatureImage: String!
    getAllCategory: [Category]!
    getAllItem: [Item]!
    vendors(latitude: Float, longitude: Float, distance: Float, offset: Int, limit: Int): resultVendor!
    vendor(id: ID!): Vendor!
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
    createItem(name: String!, price: Float!, image: String!, categoryId: ID!, description: String): Item!
    updateItem(id: ID!, name: String, price: Float, image: String, description: String): Item!
    deleteItem(id: ID!): Boolean!
    toggleItemStatus(id: ID!): Boolean!
    updateGPSAddressBuyer(latitude: Float!, longitude: Float!): String!
    addToCart(itemId: ID!, quantity: Int!): Cart!

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
