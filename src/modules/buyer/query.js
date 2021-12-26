import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, VendorFavorite, Buyer, Vendor, Shipper, Category } from "../../models";

import _ from 'lodash';

const buyerQuery = {
  getVendorFavorite: async (parent, args, context, info) => {
    global.logger.info('buyerQuery::getVendorFavorite' + JSON.stringify(args));

    // check has login
    if (!context.user) {
      throw new Error('Vui lòng đăng nhập');
    }

    // check has buyer
    const buyer = await Buyer.findOne({ accountId: context.user.id });

    if (!buyer) {
      throw new Error('Bạn chưa đăng ký là người mua');
    }

    // get vendor favorite
    const vendorFavorites = await VendorFavorite.find({ buyerId: buyer._id });

    const vendorFavoritesIds = vendorFavorites.map(vendorFavorite => vendorFavorite.vendorId);

    return Vendor.find({ _id: { $in: vendorFavoritesIds } });
  }
}

export default buyerQuery;