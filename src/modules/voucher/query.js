import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, UserVoucher, Buyer, Vendor, Shipper, Voucher } from "../../models";
import _ from 'lodash';
import moment from 'moment';

const voucherQuery = {
  getVouchers: async (root, { filter, sort, page, limit }, context) => {
    global.logger.info('voucherQuery :: getVouchers');

    // check role
    if (!context.user) {
      throw new Error('Bạn không có quyền truy cập dữ liệu');
    }

    const vendor = await Vendor.findOne({ accountId: context.user.id });

    return Voucher.find({ vendorId: vendor._id }).sort({
      createdAt: -1
    });
  },

  checkPromoCode: async (root, { promoCode, vendorId, subTotal }, context) => {
    global.logger.info('voucherQuery :: checkPromoCode');

    // check role
    if (!context.user) {
      throw new Error('Bạn không có quyền truy cập dữ liệu');
    }

    const buyer = await Buyer.findOne({ accountId: context.user.id });

    const voucher = await Voucher.findOne({ promoCode, vendorId, status: true });

    if (!voucher) {
      throw new Error('Mã khuyến mãi không tồn tại');
    }

    // check used promoCode
    const userVoucher = await UserVoucher.findOne({ voucherId: voucher._id, promoCode, buyerId: buyer._id });

    if (userVoucher) {
      throw new Error('Mã chỉ được sử dụng một lần');
    }

    // check quantity
    if (voucher.quantity && voucher.quantity <= 0) {
      throw new Error('Mã khuyến mãi đã hết');
    }

    // check startDate and endDate
    const startDate = moment(voucher.startDate);
    const endDate = moment(voucher.endDate);
    const now = moment();
    if (now.isBefore(startDate) || now.isAfter(endDate)) {
      throw new Error('Mã khuyến mãi đã hết hạn');
    }

    // check min total
    if (voucher.minTotal && voucher.minTotal > subTotal) {
      throw new Error('Mã khuyến mãi không thỏa mãn điều kiện');
    }

    return voucher;
  }
}


export default voucherQuery;