import { Router } from 'express';
import { PayPalController } from '../controllers';

export default () => {
  // create new instance of router
  const router = Router();
  const payPalController = new PayPalController();

  router.route('/').get((req, res) => payPalController.renderPayment(req, res));
  router.route('/paypal').post((req, res, next) => payPalController.payment(req, res, next));
  router.route('/success').get((req, res, next) => payPalController.success(req, res, next));

  return router;
}