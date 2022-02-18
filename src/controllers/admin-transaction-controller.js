import { Buyer, Order, Transaction, Vendor, Shipper } from '../models';
class AdminTransactionController {
  constructor(db) {
    this.rootModule = 'admin/modules/'
  }

  async renderListTransactions(req, res) {
    try {
      let { page = 1, status = 'pending', type = 'vendor' } = req.query;
      page = parseInt(page);
      const limit = 10;

      let transactions = await Transaction.find({
        type: 'withdraw',
        userType: type,
        status,
      }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

      // add field user
      transactions = await Promise.all(transactions.map(async transaction => {
        let user = null;
        if (transaction.userType === 'buyer') {
          user = await Buyer.findById(transaction.userId);
        } else if (transaction.userType === 'vendor') {
          user = await Vendor.findById(transaction.userId);
        } else if (transaction.userType === 'shipper') {
          user = await Shipper.findById(transaction.userId);
        }
        transaction.user = user;
        return transaction;
      }));

      const totalRow = await Transaction.countDocuments({ type: 'withdraw', status });
      const totalPages = Math.ceil(totalRow / limit);

      // build prePage and nextPage
      let prePage = page > 1 ? page - 1 : 1;
      let nextPage = page < totalPages ? page + 1 : totalPages;

      res.render(`${this.rootModule}transactions/list-vendor`,
        {
          titlePage: 'Danh sách yêu cầu rút tiền',
          transactions,
          totalPages,
          page,
          prePage,
          nextPage,
          status,
        }
      );

    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }
}

export default AdminTransactionController;