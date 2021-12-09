import { bcryptUtils, emailUtils, jwtUtils, logger, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper, Notification } from "../../models";
import mongoose from 'mongoose';
import _ from 'lodash';

const notificationMutation = {
  resetNumberOfNotifications: async (root, args, context, info) => {
    global.logger.info('notification::getNotifications::' + JSON.stringify(args));

    // check login 
    if (!context.user) {
      throw new Error('Bạn chưa đăng nhập');
    }

    // check role
    if (!context.user.role.includes(args.userType)) {
      throw new Error('Bạn không có quyền thực hiện hành động này');
    }

    if (args.userType === 'buyer') {
      await Buyer.findOneAndUpdate({ accountId: context.user.id }, { $set: { numberOfNotifications: 0 } });
    } else if (args.userType === 'vendor') {
      await Vendor.findOneAndUpdate({ accountId: context.user.id }, { $set: { numberOfNotifications: 0 } });
    } else if (args.userType === 'shipper') {
      await Shipper.findOneAndUpdate({ accountId: context.user.id }, { $set: { numberOfNotifications: 0 } });
    }

    return true;
  }
}

export default notificationMutation;