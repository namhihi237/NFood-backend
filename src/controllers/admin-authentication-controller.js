import { bcryptUtils } from '../utils';
import { Admin } from "../models";
const FIELDS = ['email', 'role', 'isActive', 'id'];

class AdminAuthenticationController {
  constructor() {
    this.rootModule = 'admin/modules/'
  }

  login(req, res) {
    res.render(`${this.rootModule}auth/login.ejs`, { message: '', params: null });
  }

  async postLogin(req, res) {
    global.logger.info('AdminAuthenticationController::postLogin');

    try {
      const { email, password } = req.body;

      // check require email and password
      if (!email || !password) {
        return res.render(`${this.rootModule}auth/login`, { message: 'Missing email or password' });
      }

      const user = await Admin.findOne({ email });
      global.logger.info('AdminAuthenticationController::postLogin' + JSON.stringify(user));

      if (!user) {
        return res.render(`${this.rootModule}auth/login`, { message: 'User not found', params: req.body });
      }

      // check password
      const isPasswordValid = await bcryptUtils.comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.render(`${this.rootModule}auth/login`, { message: 'Invalid password', params: req.body });
      }

      // check active
      if (!user.isActive) {
        return res.render(`${this.rootModule}auth/login`, { message: 'User is not active', params: req.body });
      }

      // create session
      req.session.user = user;
      return res.redirect('/order');

    } catch (error) {
    }
  }

  logout(req, res) {
    global.logger.info('AdminAuthenticationController::logout');
    req.session.destroy();
    res.redirect('/login');
  }
}

export default AdminAuthenticationController;