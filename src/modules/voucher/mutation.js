import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Voucher } from "../../models";
import _ from 'lodash';
import moment from 'moment';

const voucherMutation = {
  createVoucher: async (root, args, context) => {
    let { voucherCode, discount, startDate, endDate, discountType, quantity, minTotal, maxDiscount } = args;

    // check login and role
    if (!context.user || context.user.role.includes('vendor')) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    // check voucherCode
    const voucher = await Voucher.findOne({ voucherCode });
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
    if (quantity < 0) {
      throw new Error('Số lượng không được nhỏ hơn 0');
    }

    // create voucher
    const newVoucher = await Voucher.create({
      voucherCode,
      discount,
      startDate,
      endDate,
      discountType,
      quantity,
      vendorId: context.user._id,
      maxDiscount,
      minTotal
    });

    return newVoucher;
  }
}


export default voucherMutation;