import { bcryptUtils } from '../utils';

const FIELDS = ['email', 'role', 'isActive', 'id'];

class AdminAuthenticationController {
  constructor() {
    this.rootModule = 'admin/modules/'
  }

  login(req, res) {
    res.render(`${this.rootModule}auth/login.ejs`, { message: '', params: null });
  }

  // async postLogin(req, res) {
  //   global.logger.info('AdminAuthenticationController::postLogin', req.body);

  //   try {
  //     const { userName, password } = req.body;

  //     // check require username and password
  //     if (!userName || !password) {
  //       return res.render(`${this.rootModule}auth/login`, { message: 'Missing userName or password' });
  //     }

  //     const user = await this.db.Admins.findOne({ where: { userName } });

  //     logger.info('AdminAuthenticationController::postLogin', user, "user");

  //     if (!user) {
  //       return res.render(`${this.rootModule}auth/login`, { message: 'User not found', params: req.body });
  //     }

  //     // check password
  //     const isPasswordValid = await bcryptUtils.comparePassword(password, user.password);

  //     if (!isPasswordValid) {
  //       return res.render(`${this.rootModule}auth/login`, { message: 'Invalid password', params: req.body });
  //     }

  //     // check active
  //     if (!user.isActive) {
  //       return res.render(`${this.rootModule}auth/login`, { message: 'User is not active', params: req.body });
  //     }

  //     // create session
  //     req.session.user = user;
  //     return res.redirect('/dashboard');

  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // logout(req, res) {
  //   global.logger.info('AdminAuthenticationController::logout');
  //   req.session.destroy();
  //   res.redirect('/login');
  // }
}

export default AdminAuthenticationController;