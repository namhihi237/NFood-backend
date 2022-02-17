import { Router } from 'express';
import {
  AdminAuthenticationController,
  AdminDashboardController,
  BuyerAccountController
} from '../controllers';
import AdminMiddleware from '../middlewares/adminMiddleware';

export default () => {
  // create new instance of router
  const router = Router();
  const adminAuthenticationController = new AdminAuthenticationController();
  const adminDashboardController = new AdminDashboardController();
  const buyerAccountController = new BuyerAccountController();

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

  return router;
}