import { Buyer, Order, Shipper, Vendor } from '../models';
class OrderController {
  constructor(db) {
    this.db = db;
    this.rootModule = 'admin/modules/'
  }

  async renderListBuyers(req, res) {
    try {
      let { page = 1 } = req.query;
      page = parseInt(page);
      const limit = 10;

      let orders = await Order.find({

      }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

      orders = await Promise.all(orders.map(async order => {
        order.shipper = await Shipper.findById(order.shipperId);
        order.vendor = await Vendor.findById(order.vendorId);

        return order;
      }));

      const totalRow = await Order.countDocuments({});
      const totalPages = Math.ceil(totalRow / limit);

      // build prePage and nextPage
      let prePage = page > 1 ? page - 1 : 1;
      let nextPage = page < totalPages ? page + 1 : totalPages;

      res.render(`${this.rootModule}order/list`,
        {
          titlePage: 'Danh sách đơn hàng',
          orders,
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


}

export default OrderController;