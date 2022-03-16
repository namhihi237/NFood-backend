import { Vendor, Accounts } from '../models';
import { HttpError } from '../utils';
import _ from 'lodash';
class VendorAccountController {
  constructor(db) {
    this.db = db;
    this.rootModule = 'admin/modules/'
  }

  async renderListVendors(req, res) {
    try {
      let { page = 1 } = req.query;
      page = parseInt(page);
      const limit = 10;

      let vendors = await Vendor.find({
        isDeleted: {
          $ne: true
        }
      }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

      // add field phoneNumber
      vendors = await Promise.all(vendors.map(async vendor => {
        const account = await Accounts.findById({ _id: vendor.accountId });
        vendor.phoneNumber = account.phoneNumber;
        return vendor;
      }));

      const totalRow = await Vendor.countDocuments({ isDeleted: { $ne: true } });
      const totalPages = Math.ceil(totalRow / limit);

      // build prePage and nextPage
      let prePage = page > 1 ? page - 1 : 1;
      let nextPage = page < totalPages ? page + 1 : totalPages;

      res.render(`${this.rootModule}account/list-vendor`,
        {
          titlePage: 'Danh sách người bán hàng',
          vendors,
          page,
          totalPages,
          totalRow,
          prePage,
          nextPage,
          limit
        }
      );

    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }

  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;
      const vendor = await Vendor.findById(id);

      if (!vendor) {
        return res.render(`${this.rootModule}404`, {});
      }

      await Vendor.findOneAndUpdate({ _id: id }, { $set: { isActive: !vendor.isActive } });

      return res.redirect(`/vendor?page=${page}`);
    } catch (error) {
      return res.render(`${this.rootModule}error`, {});
    }
  }

  //soft erase
  async deleteVendor(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;
      const vendor = await Vendor.findById(id);

      if (!vendor) {
        return res.render(`${this.rootModule}404`, {});
      }

      await Vendor.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true } });

      return res.redirect(`/vendor?page=${page}`);
    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }

  async checkVendorOpen(req, res) {
    try {
      const vendorId = req.params.vendorId;

      // find the vendor
      const vendor = await Vendor.findOne({ _id: vendorId });

      if (!vendor) {
        throw new HttpError('Cừa hàng không tồn tại', 404);
      }

      if (!vendor.isReceiveOrder) {
        return res.status(200).json({
          status: false,
        });
      }

      // check timeOpen
      const timeOpen = vendor.timeOpen;
      let currentTime = new Date();
      // add 7 hours to current time
      currentTime.setHours(currentTime.getHours() + 7);
      const currentDay = currentTime.getDay();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();

      // convert currentDay to string
      let currentDayString = "";
      if (currentDay === 0) {
        currentDayString = "8";
      } else {
        currentDayString = (currentDay + 1).toString();
      }

      // check timeOpen
      const timeOpenItem = _.find(timeOpen, { day: currentDayString, isOpen: true });
      if (!timeOpenItem) {
        return res.status(200).json({
          status: false,
        });
      }

      // check timeOpen
      const start = parseFloat(timeOpenItem.openTime.getHours() + "." + timeOpenItem.openTime.getMinutes());
      const end = parseFloat(timeOpenItem.closeTime.getHours() + "." + timeOpenItem.closeTime.getMinutes());
      const current = parseFloat(currentHour + "." + currentMinute);

      if (current < start || current > end) {
        return res.status(200).json({
          status: false,
        });
      }

      return res.status(200).json({
        status: true,
      });

    } catch (error) {
      next(error);
    }
  }

}

export default VendorAccountController;