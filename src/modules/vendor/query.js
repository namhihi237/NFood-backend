import { bcryptUtils, emailUtils, jwtUtils, logger, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Category } from "../../models";
import mongoose from 'mongoose';
import _ from 'lodash';

const vendorQuery = {
  vendors: async (parent, args, context, info) => {
    global.logger.info('vendorQuery::vendors::' + JSON.stringify(args));

    let { latitude, longitude } = args;

    // check login
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    let account = await Accounts.findById(context.user.id);

    if (!latitude || !longitude) {
      // get location from buyer
      const buyer = await Buyer.findOne({ accountId: account._id }, { location: 1 });

      if (!buyer) {
        throw new Error('Bạn chưa là người mua');
      }

      logger.info('buyer: ' + buyer);
      if (buyer.location && buyer.location.coordinates && buyer.location.coordinates.length > 0) {
        logger.info('buyer.location: ' + buyer.location);
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

    global.logger.info('vendorQuery::' + vendors.length);

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

    logger.info('total: ' + JSON.stringify(total));

    return {
      items: vendors, total: total[0] ? total[0].total : 0
    };
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