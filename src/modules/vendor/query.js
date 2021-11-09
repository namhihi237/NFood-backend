import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category } from "../../models";

import _ from 'lodash';

const vendorQuery = {
  vendors: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::vendors::' + JSON.stringify(args));

    let { latitude, longitude } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    if (!latitude || !longitude) {
      // get location from buyer
      const buyer = await Buyer.findOne({ accountId: context.user.id }, { location: 1 });
      if (buyer.location) {
        latitude = buyer.location.coordinates[1];
        longitude = buyer.location.coordinates[0];
      }
    }

    if (!latitude || !longitude) {
      throw new Error('Không tìm thấy vị trí của bạn');
    }

    let vendors = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance",
          maxDistance: (args.distance || 5) * 1000, // meters
          spherical: true,
        }
      }
    ]);
    let total = await Vendor.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "distance",
          maxDistance: (args.distance || 5) * 1000, // meters
          spherical: true,
        },
      }, {
        $count: "total"
      }
    ]);


    return {
      items: vendors, total: total[0].total
    }
  },

  // get detail of vendor
  vendor: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::vendor::' + JSON.stringify(args));

    let vendor = await Vendor.findOne({ _id: args.id });

    if (!vendor) {
      throw new Error('Không tìm thấy cửa hàng');
    }

    global.logger.info('vendorQuery::vendor::' + JSON.stringify(vendor));

    // get menu of vendor
    const menu = await Category.find({ vendorId: vendor._id, isActive: true });

    vendor.menu = menu;

    return vendor;
  }
}

export default vendorQuery;