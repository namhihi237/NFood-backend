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
  router.route('/charge-order').post(authenticationMiddleware.jwtMiddleware, (req, res, next) => payPalController.createChargeOrder(req, res, next));

  return router;
}