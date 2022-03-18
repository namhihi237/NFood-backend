import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, VendorFavorite, Buyer, Vendor, Shipper, Category } from "../../models";
import { buyerData } from '../../configs';
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

    let vendors = await Vendor.find({ _id: { $in: vendorFavoritesIds } });

    vendors = await Promise.all(vendors.map(async (vendor) => {
      let menu = await Category.find({ vendorId: vendor._id, isActive: true });
      vendor.menu = menu;
      return vendor;
    }));

    return vendors;

  },

  initDataBuyer: async (parent, args, context, info) => {
    let { account, password } = buyerData

    // generate password
    password = await bcryptUtils.hashPassword(password);

    account = account.map( (acc) => {
      return {
        ...acc,
        password: password
      }
    });
    console.log(account);


    // delete the account in account
    account.forEach(async (acc) => { 
      const existing = await Accounts.findOne({ phoneNumber: acc.phoneNumber });

      if (existing) { 
        await Accounts.findOneAndRemove({ _id: existing._id });

        // delete the buyer
        await Buyer.findOneAndRemove({ accountId: existing._id });
      }
    });

    // create account

    account.map(async (acc) => {
      let account = await Accounts.create(acc);
      await Buyer.create({
        accountId: account._id,
        ...acc.buyer
      });
    });

    return true;
  }
}

export default buyerQuery;