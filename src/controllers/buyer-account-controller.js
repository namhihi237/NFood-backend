import { Buyer, Order } from '../models';
class BuyerAccountController {
  constructor(db) {
    this.db = db;
    this.rootModule = 'admin/modules/'
  }

  async renderListBuyers(req, res) {
    try {
      let { page = 1 } = req.query;
      page = parseInt(page);
      const limit = 10;

      let buyers = await Buyer.find({
        isDeleted: {
          $ne: true
        }
      }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

      // add field number of orders
      buyers = await Promise.all(buyers.map(async buyer => {
        let numberOfOrders = await Order.countDocuments({ ownerId: buyer._id });
        buyer.numberOfOrders = numberOfOrders;
        return buyer;
      }));

      const totalRow = await Buyer.countDocuments({ isDeleted: { $ne: true } });
      const totalPages = Math.ceil(totalRow / limit);

      // build prePage and nextPage
      let prePage = page > 1 ? page - 1 : 1;
      let nextPage = page < totalPages ? page + 1 : totalPages;

      res.render(`${this.rootModule}account/list-buyer`,
        {
          titlePage: 'Danh sách người mua',
          buyers,
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
      const buyer = await Buyer.findById(id);

      if (!buyer) {
        return res.render(`${this.rootModule}404`, {});
      }

      await Buyer.findOneAndUpdate({ _id: id }, { $set: { isActive: !buyer.isActive } });

      return res.redirect(`/buyer?page=${page}`);
    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }


  //soft erase
  async deleteBuyer(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;
      const buyer = await Buyer.findById(id);

      if (!buyer) {
        return res.render(`${this.rootModule}404`, {});
      }

      await Buyer.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true } });

      return res.redirect(`/buyer?page=${page}`);
    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }

}

export default BuyerAccountController;