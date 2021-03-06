import { Router } from 'express';
import { PayPalController } from '../controllers';
import AuthenticationMiddleware from '../middlewares/apiMiddleware';
export default () => {
  // create new instance of router
  const router = Router();
  const payPalController = new PayPalController();
  const authenticationMiddleware = new AuthenticationMiddleware();

  router.route('/').get((req, res) => payPalController.renderPayment(req, res));
  router.route('/paypal').post((req, res, next) => payPalController.payment(req, res, next));
  router.route('/success').get((req, res, next) => payPalController.success(req, res, next));
  router.route('/charge-success').get((req, res, next) => payPalController.chargeOrderSuccess(req, res, next));
  router.route('/charge-cancel').get((req, res, next) => payPalController.chargeOrderCancel(req, res, next));
  router.route('/charge-order').post(authenticationMiddleware.jwtMiddleware, (req, res, next) => payPalController.createChargeOrder(req, res, next));
  router.route('/deposit').post(authenticationMiddleware.jwtMiddleware, (req, res, next) => payPalController.deposit(req, res, next));
  router.route('/deposit-success').get((req, res, next) => payPalController.depositSuccess(req, res, next));
  router.route('/deposit-cancel').get((req, res, next) => payPalController.depositCancel(req, res, next));

  return router;
}