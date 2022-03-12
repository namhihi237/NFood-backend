import { Buyer, Notification, Transaction, Vendor, Shipper, Accounts } from '../models';
import { Parser } from 'json2csv';
class AdminTransactionController {
  constructor(db) {
    this.rootModule = 'admin/modules/'
  }

  async renderListTransactions(req, res) {
    try {
      let { page = 1, status, type = 'vendor' } = req.query;
      page = parseInt(page);
      const limit = 10;

      let conditions = {
        userType: type,
        type: 'withdraw',
      };

      if (status) {
        conditions = { ...conditions, status };
      }

      let transactions = await Transaction.find(conditions).
        sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

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
        return {
          ...transaction.toObject(),
          user,
        }
      }));

      const totalRow = await Transaction.countDocuments(conditions);
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
          totalRow,
          prePage,
          nextPage,
          status,
          type,
          limit
        }
      );

    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }

  async completeTransactions(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return res.render(`${this.rootModule}404`, {});
      }

      await Transaction.findByIdAndUpdate(id, { status: 'success' });

      let userId = null;
      if (transaction.userType === 'shipper') {
        const shipper = await Shipper.findById(transaction.userId);
        userId = shipper.accountId;
      } else if (transaction.userType === 'vendor') {
        const vendor = await Vendor.findById(transaction.userId);
        userId = vendor.accountId;
      }

      await Notification.create({
        userId,
        type: 'success-withdraw',
        content: `Bạn đã thành công rút số tiền ${transaction.amount} về tài khoản ${transaction.bank.accountNumber}`,
        userType: transaction.userType,
      });

      res.redirect(`/transaction?type=${transaction.userType}&page=${page}`);

    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }

  async rejectTransactions(req, res) {
    try {
      const { id } = req.params;
      const { page = 1 } = req.query;

      const transaction = await Transaction.findById(id);

      if (!transaction) {
        return res.render(`${this.rootModule}404`, {});
      }

      // refund money
      if (transaction.userType === 'shipper') {
        await Shipper.findByIdAndUpdate(transaction.userId, {
          $inc: { money: (transaction.amount + transaction.fee) }
        });
      } else if (transaction.userType === 'vendor') {
        await Vendor.findByIdAndUpdate(transaction.userId, {
          $inc: { money: (transaction.amount + transaction.fee) }
        });
      }

      await Transaction.findByIdAndUpdate(id, { status: 'reject' });

      let userId = null;
      if (transaction.userType === 'shipper') {
        const shipper = await Shipper.findById(transaction.userId);
        userId = shipper.accountId;
      } else if (transaction.userType === 'vendor') {
        const vendor = await Vendor.findById(transaction.userId);
        userId = vendor.accountId;
      }

      await Notification.create({
        userId,
        type: 'reject-withdraw',
        content: `Bạn đã bị từ chối yêu cầu rút số tiền ${transaction.amount} về tài khoản ${transaction.bank.accountNumber}`,
        userType: transaction.userType,
      });

      res.redirect(`/transaction?type=${transaction.userType}&page=${page}`);

    } catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }

  async exportTransactions(req, res) { // export to csv
    try {
      let { type = 'vendor' } = req.query;

      let conditions = {
        userType: type,
        type: 'withdraw',
      }

      let transactions = await Transaction.find(conditions).
        sort({ createdAt: -1 });


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
        return {
          ...transaction.toObject(),
          user,
        }
      }));

      const fields = [
        {
          label: 'ID',
          value: '_id',
        },
        {
          label: 'Ten nguoi dung',
          value: 'user',
        },
        {
          label: 'So dien thoai',
          value: 'phone',
        },
        {
          label: 'So tien can rut',
          value: 'amount',
        },
        {
          label: 'Phi chuyen khoan',
          value: 'fee',
        },
        {
          label: 'Trang thai',
          value: 'status',
        },
        {
          label: 'Thoi gian yeu cau',
          value: 'createdAt',
        },
        {
          label: 'So tai khoan',
          value: 'bank.accountNumber',
        },
        {
          label: 'Ten tai khoan',
          value: 'bank.accountName',
        },
        {
          label: 'Ten ngan hang',
          value: 'bank.bankName',
        }
      ];

      let csvData = [];

      transactions.forEach(transaction => {
        let data = {
          _id: transaction._id,
          user: transaction.user.name,
          phone: transaction.user.phoneNumber,
          amount: transaction.amount,
          fee: transaction.fee,
          status: transaction.status,
          createdAt: transaction.createdAt,
          bank: {
            accountNumber: transaction.bank.accountNumber,
            accountName: transaction.bank.accountName,
            bankName: transaction.bank.bankName.split(' - ')[1],
          }
        };

        csvData.push(data);
      });

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);

      res.setHeader('Content-disposition', 'attachment; filename=transactions.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
    }
    catch (error) {
      res.render(`${this.rootModule}error`, {});
    }
  }
}

export default AdminTransactionController;