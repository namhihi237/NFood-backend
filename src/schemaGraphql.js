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
    isReceiveOrder: Boolean
    isShippingOrder: Boolean
    numberOfNotifications: Int
    identityCard: IdentityCard
    birthday: String
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
    rating: Float
    image: String
    distance: Float
    address: String
    numberOfReviews: Int
    menu: [Category]
    location: Location
    isActive: Boolean
    phoneNumber: String
  }

  type Location {
    coordinates: [Float]
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
    vendorId: ID
    item: Item
    quantity: Int
    createdAt: String
  }

  type resultCart {
    carts: [Cart!]
    vendor: Vendor
  }

  type ReviewResult {
    reviews: [Review!]
    badReviews: Int
    goodReviews: Int
    normalReviews: Int
  }

  type Order {
    _id: ID!
    invoiceNumber: String!
    subTotal: Float!
    shipping: Float!
    discount: Float!
    total: Float!
    orderItems: [OrderItem]!
    address: String!
    phoneNumber: String!
    name: String!
    deliveredAt: String
    acceptedShippingAt: String
    estimatedDeliveryTime: String
    paymentStatus: String
    orderStatus: String!
    createdAt: String
    vendorId: ID
    vendor: Vendor
    shipperId: ID
    shipper: Shipper
    buyerId: ID
    buyer: Buyer
    paymentMethod: methodEnum
    isReviewedShipper: Boolean
    isReviewVendor: Boolean

  }

  type Shipper {
    _id: ID!
    name: String
    phoneNumber: String
    image: String
    identityCard: IdentityCard
  }

  type IdentityCard {
    number: String
    date: String
    place: String
    beforeImage: String
    afterImage: String
  }

  type OrderItem {
    _id: ID!
    buyerId: ID!
    price: Float!
    quantity: Int!
    name: String!
    buyerName: String!
    image: String
    note: String
  }

  type Voucher {
    _id: ID!
    promoCode: String!
    discount: Float!
    status: Boolean!
    quantity: Int
    startDate: String
    endDate: String
    discountType: discountType
    createdAt: String
  }

  type Buyer {
    _id: ID!
    name: String
    phoneNumber: String
    image: String
  }

  type Notification {
    _id: ID!
    content: String!
    image: String
    type: String!
    orderId: ID
    createdAt: String
  }

  type NotificationResponse {
    items : [Notification!]
    total: Int!
  }

  # for vendor
  type Report {
    totalRevenue: Float!
    totalOrder: Int!
    totalOrderCompleted: Int!
    accountBalance: Float!
  }

  type Review {
    _id: ID!
    rating: Float!
    comment: String!
    image: String
    buyerId: ID!
    buyer : Buyer
    reviewedId: ID!
    type: String!
    createdAt: String
  }

  type ReportShipper {
    deliveryMoney: Float!
    buyOrderMoney: Float!
    rewardMoney: Float!
    balanceWallet: Float!
    totalOrder: Int!
  }

  type IncomeShipper {
    totalIncome: Float
    totalShipping: Float
    rewardPoint: Float
    totalOrder: Int
  }

  type Query {
    getUser(role: roleEnum!): User
    getSignatureImage: String!
    getAllCategory: [Category]!
    getAllItem: [Item]!
    vendors(latitude: Float, longitude: Float, distance: Float, offset: Int, limit: Int): resultVendor!
    vendor(id: ID!): Vendor!
    getAllVendors(keyword: String, offset: Int, limit: Int, distance: Float): resultVendor!
    carts: resultCart!
    getQuantityOfCart: Int!
    calculateShipping(vendorId: ID!): Float! 
    getOrderByVendor: [Order]!
    getOrderByBuyer: [Order]!
    getOrderByShipper: [Order]!
    getOrderByDistances: [Order]!
    getOrderById(id: ID!): Order!
    getNotifications(skip: Int, limit: Int, userType: roleEnum!): NotificationResponse!
    getNumberOfNotifications(userType: roleEnum!): Int!
    getVouchers: [Voucher]!
    checkPromoCode(promoCode: String!, vendorId: ID!, subTotal: Float!): Voucher!
    getOrderByIdBuyer(id: ID!): Order!
    getMaxDistanceFindOrder: Float!
    getVendorFavorite: [Vendor]!
    vendorReport(type: reportType!, time: String!): Report!
    getReviews(type: reviewEnum!): ReviewResult!
    getReportsByShipper: ReportShipper!
    getIncomesByShipper(type: reportType!, time: String!): IncomeShipper!

  }

  type Subscription {
    orderShipping: Order!
    numberOfNotifications(userType: roleEnum!): Int!
    locationShipper(orderId: ID!):[Float]
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
    addToCart(itemId: ID!, quantity: Int!, vendorId: ID!, note: String): Cart!
    removeFromCart(id: ID!): Boolean!
    updateQuantityInCart(id: ID!, quantity: Int!): Cart!
    checkout(method: methodEnum!, note: String, promoCode: String ): Order!
    activeShipper(name: String!, image: String!): Response!
    activeShippingOrder: Boolean!
    updateLocationShipper(latitude: Float!, longitude: Float!): Boolean!
    acceptShippingOrder(orderId: ID!): Order!
    pickUpOrder(orderId: ID!): Boolean!
    completeShippingOrder(orderId: ID!): Boolean!
    createVoucher(inputVoucher: inputVoucher!): Voucher!
    deleteVoucher(id: ID!): Boolean!
    toggleVoucherStatus(id: ID!): Boolean!
    updateVoucher(id: ID!, inputVoucher: inputVoucher!): Boolean!
    resetNumberOfNotifications(userType: roleEnum!): Boolean!
    updateMaxDistanceReceiveOrder(maxDistance: Float!): Boolean!
    cancelOrder(id: ID!): Boolean!
    updateStatusReceiveOrder: Boolean!
    addVendorFavorite(vendorId: ID!, isAdd: Boolean!): Boolean!
    addReview(rating: Int!, comment: String!, reviewedId: ID!, type: reviewEnum!, orderId: ID!): Boolean!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    forgotPassword(phoneNumber: String!): Boolean!
    verifyCode(code: String!, phoneNumber: String!): Boolean!
    updatePassword(password: String!, code: String!): Boolean!
  }

  input inputVoucher {
    promoCode: String!
    discount: Float!
    quantity: Int
    startDate: String
    endDate: String
    discountType: discountType!
    maxDiscount: Float
    minTotal: Float
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

  enum methodEnum {
    COD
    CRE
  }

  enum discountType {
    PERCENT
    FIXED
  }

  enum reportType {
    DATE
    MONTH
  }

  enum reviewEnum {
    vendor
    item
    shipper
  }
`;
