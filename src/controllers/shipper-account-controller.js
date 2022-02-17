import { Shipper, Accounts, Order } from '../models';
class ShipperAccountController {
  constructor(db) {
    this.db = db;
    this.rootModule = 'admin/modules/'
  }

  async renderListShippers(req, res) {
    try {
      let { page = 1 } = req.query;
      page = parseInt(page);
      const limit = 10;

      let shippers = await Shipper.find({
        isDeleted: {
          $ne: true
        }
      }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

      // add field phoneNumber
      shippers = await Promise.all(shippers.map(async shipper => {
        const account = await Accounts.findById({ _id: shipper.accountId });
        const numberOfOrders = await Order.countDocuments({ shipperId: shipper._id });
        shipper.phoneNumber = account.phoneNumber;
        shipper.numberOfOrders = numberOfOrders;
        return shipper;
      }));

      const totalRow = await Shipper.countDocuments({ isDeleted: { $ne: true } });
      const totalPages = Math.ceil(totalRow / limit);

      // build prePage and nextPage
      let prePage = page > 1 ? page - 1 : 1;
      let nextPage = page < totalPages ? page + 1 : totalPages;

      res.render(`${this.rootModule}account/list-shipper`,
        {
          titlePage: 'Danh sách người giao hàng',
          shippers,
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
      const shipper = await Shipper.findById(id);

      if (!shipper) {
        return res.render(`${this.rootModule}404`, {});
      }

      await Shipper.findOneAndUpdate({ _id: id }, { $set: { isActive: !shipper.isActive } });

      return res.redirect(`/shipper?page=${page}`);
    } catch (error) {
      return res.render(`${this.rootModule}error`, {});
    }
  }

  //soft erase
  async deleteShipper(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;
      const shipper = await Shipper.findById(id);

      if (!shipper) {
        return res.render(`${this.rootModule}404`, {});
      }

      await Shipper.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true } });

      return res.redirect(`/shipper?page=${page}`);
    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }

}

export default ShipperAccountController;