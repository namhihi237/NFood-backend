import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, Order, Buyer, Vendor, Shipper, UserVoucher, Voucher } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import { constants } from "../../configs";
import moment from 'moment';
class OrderService {
  async calculateShippingCost(userId, vendorId) {
    global.logger.info('OrderService::calculateShippingCost:: ' + JSON.stringify({ userId }) + ' ' + JSON.stringify({ vendorId }));
    const buyer = await Buyer.findOne({ accountId: userId });

    if (!buyer) {
      throw new Error('bạn không phải là người mua hàng');
    }

    let latitude, longitude;
    if (buyer.location && buyer.location.coordinates && buyer.location.coordinates.length > 0) {
      logger.info('buyer.location: ' + buyer.location);
      latitude = buyer.location.coordinates[1];
      longitude = buyer.location.coordinates[0];
    }

    if (!latitude || !longitude) {
      throw new Error('Bạn chưa cập nhật địa chỉ');
    }

    let vendors = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance",
          spherical: true,
        }
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId(vendorId)
        }
      },
    ]);

    global.logger.info('vendors:: ' + JSON.stringify(vendors));

    // calculate shipping
    let shipping = 0;
    if (vendors.length > 0) {
      // const distance = vendors[0].distance;
      // if (distance < constants.MAX_DISTANCE_FOR_FREE_SHIPPING) {// < 2km free shipping
      //   shipping = 0;
      // } else if (distance > constants.MAX_DISTANCE_FOR_FREE_SHIPPING && distance < 10000) { // 2-10km shipping 2000d/km
      //   shipping = Math.ceil(parseFloat((distance - constants.MAX_DISTANCE_FOR_FREE_SHIPPING) / 1000).toFixed(1)) * constants.SHIPPING_RATES;
      // } else if (distance > 10000) { // >10km shipping 3000d/km
      //   shipping = Math.ceil(parseFloat((distance - constants.MAX_DISTANCE_FOR_FREE_SHIPPING) / 1000).toFixed(1)) * constants.SHIPPING_RATES_OVER_10KM;
      // }

      const distance = vendors[0].distance;
      shipping = Math.ceil(parseFloat(distance / 1000).toFixed(1)) * constants.SHIPPING_RATES;
    }
    return shipping;
  }

  // generate invoice number from order
  async generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // invoice number format: YYYYMM-6[number or anphabet]
    let invoiceNumber = `${year}${month}-`;

    // random 6 number or anphabet
    const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 6; i++) {
      random += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    invoiceNumber += random;

    // check if invoice number is exist
    const order = await Order.findOne({ invoiceNumber });
    if (order) {
      return generateInvoiceNumber();
    }
    return invoiceNumber;
  }

  async calculateDiscount(vendorId, buyerId, promoCode, subTotal, create) {
    global.logger.info('OrderService::calculateDiscount:: ');
    const voucher = await Voucher.findOne({ promoCode, vendorId });
    if (!voucher) {
      console.log('voucher not found');
      return null;
    }

    const userVoucher = await UserVoucher.findOne({ voucherId: voucher._id, buyerId, promoCode: voucher.promoCode });
    if (userVoucher) {
      console.log('userVoucher  found');
      return null;
    }

    // check quantity
    if (voucher.quantity && voucher.quantity <= 0) {
      console.log('quantity  found');
      return null;
    }

    // check start date and end date
    // check startDate and endDate
    const startDate = moment(voucher.startDate);
    const endDate = moment(voucher.endDate);
    const now = moment();

    if (now.isBefore(startDate) || now.isAfter(endDate)) {
      console.log('now  found');
      return null;
    }

    // check minTotal
    if (voucher.minTotal && subTotal < voucher.minTotal) {
      console.log('minTotal  found');
      return null;
    }

    // calculate discount
    let discount = 0;
    if (voucher.discountType === 'PERCENT') {
      discount = subTotal * voucher.discount / 100;
    } else if (voucher.discountType === 'FIXED') {
      discount = voucher.discount;
    }

    if (create) {
      await UserVoucher.create({
        buyerId,
        voucherId: voucher._id,
        promoCode: voucher.promoCode,
      });

      if (voucher.quantity) {
        await Voucher.updateOne({ _id: voucher._id }, { $inc: { quantity: -1 } });
      }
    }

    return discount;
  }

}

export default new OrderService();