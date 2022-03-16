import { Router } from 'express';
import { VendorAccountController } from '../controllers';
export default () => {
  // create new instance of router
  const router = Router();
  const vendorController = new VendorAccountController();

  router.route('/vendorId/check-open').get((req, res) => vendorController.checkVendorOpen(req, res));

  return router;
}