import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper } from "../../models";

import _ from 'lodash';

const buyerMutation = {
  setNameBuyer: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::setNameBuyer' + JSON.stringify(args));
    let { name } = args;

    // check has login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    // check required fields
    if (!name) {
      throw new Error('Nhập tên gọi của bạn');
    }

    // check has buyer
    let account = await Accounts.findById(context.user.id);

    if (account.isBuyer) {
      throw new Error('Bạn đã là người mua');
    }
    // update name buyer
    await Buyer.findOneAndUpdate({ accountId: context.user.id }, { name });

    if (!account.role.includes('buyer')) {
      await Accounts.findByIdAndUpdate(context.user.id, { isBuyer: true, $push: { roles: 'buyer' } });
    }

    return {
      success: true,
      message: 'Bạn đã đăng ký thành công, tiến hành mua hàng thôi nào.'
    }
  }
}

export default buyerMutation;