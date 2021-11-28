import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipper',
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    promoCode: {
      type: String,
    },
    discount: {
      type: Number
    },
    shipping: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Cancelled'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    acceptedShippingAt: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    pickUpTime: {
      type: Date,
    },
    orderItems: {
      type: [
        {
          itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
          },
          name: {
            type: String,
          },
          buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Buyer',
            required: true,
          },
          buyerName: {
            type: String,
          },
          quantity: {
            type: Number,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          note: {
            type: String,
          },
          image: {
            type: String,
          }
        },
      ],
    }

  },
  { timestamps: true }
);

export default mongoose.model('order', OrderSchema, 'order');