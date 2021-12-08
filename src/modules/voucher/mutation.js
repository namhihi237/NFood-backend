import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Voucher } from "../../models";
import _ from 'lodash';
import moment from 'moment';

const voucherMutation = {
  createVoucher: async (root, args, context) => {
    global.logger.info('voucherMutation :: createVoucher :: ' + JSON.stringify(args.inputVoucher));

    let { promoCode, discount, startDate, endDate, discountType, quantity, minTotal, maxDiscount } = args.inputVoucher;

    // check login and role
    if (!context.user || !context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    const vendor = await Vendor.findOne({ accountId: context.user._id });

    // check promo code
    const voucher = await Voucher.findOne({ promoCode, vendorId: vendor._id });
    if (voucher) {
      throw new Error('Mã voucher đã tồn tại');
    }

    // check discount
    if (discountType === 'PERCENT') {
      if (discount > 100 || discount < 0) {
        throw new Error('Giảm giá không được lớn hơn 100% hoặc nhỏ hơn 0%');
      }
    }

    if (discountType === 'FIXED') {
      if (discount < 0) {
        throw new Error('Giảm giá không được nhỏ hơn 0');
      }
    }

    // check startDate if it exists
    if (startDate) {
      if (!moment(startDate).isValid()) {
        throw new Error('Ngày bắt đầu không đúng định dạng');
      }
      // check valid startDate
      if (moment(startDate).isBefore(moment())) {
        throw new Error('Ngày bắt đầu phải sau ngày hiện tại');
      }

      startDate = new Date(startDate);
    }

    if (endDate) {
      if (!moment(endDate).isValid()) {
        throw new Error('Ngày kết thúc không đúng định dạng');
      }
      // check valid endDate
      if (moment(endDate).isBefore(moment())) {
        throw new Error('Ngày kết thúc phải sau ngày hiện tại');
      }

      endDate = new Date(endDate);
    }

    // check quantity
    if (quantity && quantity < 0) {
      throw new Error('Số lượng không được nhỏ hơn 0');
    }

    // create voucher
    const newVoucher = await Voucher.create({
      promoCode,
      discount,
      startDate,
      endDate,
      discountType,
      quantity,
      vendorId: vendor._id,
      maxDiscount,
      minTotal
    });

    return newVoucher;
  },

  deleteVoucher: async (root, args, context) => {
    global.logger.info('voucherMutation :: deleteVoucher :: ' + JSON.stringify(args.voucherId));

    // check login and role
    if (!context.user || !context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    const vendor = await Vendor.findOne({ accountId: context.user._id });

    // check voucher
    const voucher = await Voucher.findOne({ _id: args.voucherId, vendorId: vendor._id });
    if (!voucher) {
      throw new Error('Mã voucher không tồn tại');
    }

    // delete voucher
    await Voucher.deleteOne({ _id: args.voucherId });

    return true;
  },

  toggleVoucherStatus: async (root, args, context) => {
    global.logger.info('voucherMutation :: toggleVoucherStatus :: ' + JSON.stringify(args));

    // check login and role
    if (!context.user || !context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    const vendor = await Vendor.findOne({ accountId: context.user._id });

    // check voucher
    const voucher = await Voucher.findOne({ _id: args.id, vendorId: vendor._id });
    if (!voucher) {
      throw new Error('Mã voucher không tồn tại');
    }

    // toggle status
    voucher.status = !voucher.status;
    await voucher.save();

    return voucher;
  }
}


export default voucherMutation;