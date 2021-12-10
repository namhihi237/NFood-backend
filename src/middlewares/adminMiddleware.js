class AdminMiddleware {
  constructor(db) {
    this.db = db
  }
  async isAdmin(req, res, next) {
    const { id } = req.session.user;
    const user = await User.findOne({ where: { id } });
    if (user.role != 'admin') {
      return res.status(401).json({
        status: 401,
        error: 'You are not an admin',
      });
    }
    req.user = req.session.user;
    res.locals.userName = req.session.user.userName;

    return next();
  }

  async isLoggedIn(req, res, next) {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    req.user = req.session.user;
    res.locals.userName = req.session.user.userName;

    return next();
  }

  renderError(req, res, next) {
    res.render('admin/modules/error/404.ejs');
  }

}

export default AdminMiddleware;