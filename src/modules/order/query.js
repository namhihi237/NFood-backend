import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category, Item } from "../../models";
import _ from 'lodash';
import mongoose from 'mongoose';
import { constants } from "../../configs";

const orderQuery = {
  calculateShipping: async (path, args, context, info) => {
    global.logger.info('orderQuery::calculateShipping' + JSON.stringify(args));

    // check login and role
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    const account = await Accounts.findOne({ _id: context.user._id });

    const buyer = await Buyer.findOne({ accountId: account._id });

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
          _id: mongoose.Types.ObjectId(args.vendorId)
        }
      },
    ]);

    global.logger.info('vendors:: ' + JSON.stringify(vendors));

    // calculate shipping
    let shipping = 0;
    if (vendors.length > 0) {
      const distance = vendors[0].distance;
      if (distance < constants.MAX_DISTANCE_FOR_FREE_SHIPPING) {// < 2km free shipping
        shipping = 0;
      } else if (distance > constants.MAX_DISTANCE_FOR_FREE_SHIPPING && distance < 10000) { // 2-10km shipping 2000d/km
        shipping = Math.ceil(parseFloat((distance - constants.MAX_DISTANCE_FOR_FREE_SHIPPING) / 1000).toFixed(1)) * constants.SHIPPING_RATES;
      } else if (distance > 10000) { // >10km shipping 3000d/km
        shipping = Math.ceil(parseFloat((distance - constants.MAX_DISTANCE_FOR_FREE_SHIPPING) / 1000).toFixed(1)) * constants.SHIPPING_RATES_OVER_10KM;
      }
    }
    return shipping;
  }
};

export default orderQuery;