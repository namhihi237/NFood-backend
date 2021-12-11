import { bcryptUtils } from '../utils';

const FIELDS = ['username', 'role', 'isActive', 'id'];

class AdminDashboardController {
  constructor(db) {
    this.db = db;
    this.rootModule = 'admin/modules/'
  }

  renderDashboard(req, res) {
    res.render(`${this.rootModule}dashboard/dashboard`, { titlePage: 'Dashboard' });
  }

}

export default AdminDashboardController;