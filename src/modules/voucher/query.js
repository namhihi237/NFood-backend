import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Voucher } from "../../models";
import _ from 'lodash';
import moment from 'moment';

const voucherQuery = {
  getVouchers: async (root, { filter, sort, page, limit }, context) => {
    global.logger.info('voucherQuery :: getVouchers');

    // check role
    if (!context.user) {
      throw new Error('Bạn không có quyền truy cập dữ liệu');
    }

    const vendor = await Vendor.findOne({ accountId: context.user._id });

    return Voucher.find({ vendorId: vendor._id })
  }
}


export default voucherQuery;