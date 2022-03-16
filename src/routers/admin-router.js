import { Router } from 'express';
import {
  AdminAuthenticationController,
  AdminDashboardController,
  BuyerAccountController,
  VendorAccountController,
  ShipperAccountController,
  AdminTransactionController,
  OrderController
} from '../controllers';
import AdminMiddleware from '../middlewares/adminMiddleware';

export default () => {
  // create new instance of router
  const router = Router();
  const adminAuthenticationController = new AdminAuthenticationController();
  const adminDashboardController = new AdminDashboardController();
  const buyerAccountController = new BuyerAccountController();
  const vendorAccountController = new VendorAccountController();
  const shipperAccountController = new ShipperAccountController();
  const adminTransactionController = new AdminTransactionController();
  const orderController = new OrderController();

  const adminMiddleware = new AdminMiddleware();
  // authentication routes
  router.route('/login').get((req, res) => adminAuthenticationController.login(req, res));
  router.route('/login').post((req, res) => adminAuthenticationController.postLogin(req, res));
  router.route('/logout').get((req, res) => adminAuthenticationController.logout(req, res));

  // dashboard routes
  router.route('/dashboard').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => adminDashboardController.renderDashboard(req, res));

  // account user routes
  router.route('/buyer').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => buyerAccountController.renderListBuyers(req, res));
  router.route('/buyer/:id/toggle').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => buyerAccountController.toggleStatus(req, res));
  router.route('/buyer/:id/delete').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => buyerAccountController.deleteBuyer(req, res));


  // account vendor routes
  router.route('/vendor').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => vendorAccountController.renderListVendors(req, res));
  router.route('/vendor/:id/toggle').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => vendorAccountController.toggleStatus(req, res));
  router.route('/vendor/:id/delete').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => vendorAccountController.deleteVendor(req, res));

  // api
  router.route('/api/vendor/:vendorId/check-open').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => vendorAccountController.checkVendorOpen(req, res));

  // account shipper routes
  router.route('/shipper').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => shipperAccountController.renderListShippers(req, res));
  router.route('/shipper/:id/toggle').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => shipperAccountController.toggleStatus(req, res));
  router.route('/shipper/:id/delete').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => shipperAccountController9.deleteShipper(req, res));


  // transaction routes
  router.route('/transaction').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => adminTransactionController.renderListTransactions(req, res));
  router.route('/transaction/:id/complete').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => adminTransactionController.completeTransactions(req, res));
  router.route('/transaction/:id/reject').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => adminTransactionController.rejectTransactions(req, res));
  router.route('/transaction/download').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => adminTransactionController.exportTransactions(req, res));

  router.route('/order').get((req, res, next) => adminMiddleware.isLoggedIn(req, res, next), (req, res) => orderController.renderListBuyers(req, res));

  return router;
}