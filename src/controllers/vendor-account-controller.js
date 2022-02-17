import { Vendor, Accounts } from '../models';
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
          nextPage
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
      console.log(vendor);

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

}

export default VendorAccountController;