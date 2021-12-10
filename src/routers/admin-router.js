import { Router } from 'express';
import { AdminAuthenticationController } from '../controllers';
import AdminMiddleware from '../middlewares/adminMiddleware';

export default () => {
  // create new instance of router
  const router = Router();
  const adminAuthenticationController = new AdminAuthenticationController();

  const adminMiddleware = new AdminMiddleware();
  // authentication routes
  router.route('/login').get((req, res) => adminAuthenticationController.login(req, res));
  // router.route('/login').post((req, res) => adminAuthenticationController.postLogin(req, res));
  // router.route('/logout').get((req, res) => adminAuthenticationController.logout(req, res));


  return router;
}