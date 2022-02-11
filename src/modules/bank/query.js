import { bcryptUtils, emailUtils, jwtUtils, smsUtils, hereUtils } from '../../utils';
import { Accounts, VendorFavorite, Buyer, Vendor, Shipper } from "../../models";

import _ from 'lodash';
const FEE = 3300; // vnd
const MIN_WITHDRAWAL = 50000; // vnd

const bankQuery = {
  getWithdrawal: async (parent, args, context, info) => {
    global.logger.info('bankMutation.getWithdrawal', JSON.stringify(args));

    const { type } = args;

    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    let user = null;
    if (type === 'vendor') {
      user = await Vendor.findOne({ accountId: context.user.id });
    } else if (type === 'buyer') {
      user = await Buyer.findOne({ accountId: context.user.id });
    } else if (type === 'shipper') {
      user = await Shipper.findOne({ accountId: context.user.id });
    }

    if (!user) {
      throw new Error('Có lỗi xảy ra');
    }

    const { bank, money } = user;

    if (!bank) {
      throw new Error('Bạn chưa cập nhật thông tin ngân hàng');
    }

    return {
      bank,
      money,
      fee: FEE,
      minWithdrawal: MIN_WITHDRAWAL,
      maxWithdrawal: money - FEE,
    }
  }
}

export default bankQuery;