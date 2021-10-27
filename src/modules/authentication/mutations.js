import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../utils';
import { Accounts, CodeResets, Buyer, Vendor, Shipper } from "../../models";

import _ from 'lodash';
const LIMIT_TIME_SEND_SMS = 2 * 60 * 1000;

const authenticationMutation = {
  register: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::register' + JSON.stringify(args));
    let { phoneNumber, password, role } = args;

    // check required fields
    if (!phoneNumber || !password) {
      throw new Error('Vui lòng nhập đủ tông tin!');
    }

    // convert phone number to vietnam phone number
    phoneNumber = await smsUtils.convertPhoneNumber(phoneNumber);

    // check if user already exists
    const user = await Accounts.findOne({ phoneNumber });

    if (user) {
      throw new Error('Số điện thoại đã được sử dụng');
    }

    const hashPassword = await bcryptUtils.hashPassword(password);

    // create account
    const newUser = await Accounts.create({ phoneNumber, password: hashPassword, role: [role] });

    // create user by roleEnum
    if (role === 'buyer') {
      await Buyer.create({ accountId: newUser.id });
    } else if (role === 'vendor') {
      await Vendor.create({ accountId: newUser.id });
    } else if (role === 'shipper') {
      await Shipper.create({ accountId: newUser.id });
    }

    // send sms active phone number
    const code = await smsUtils.sendCodePhoneActive(phoneNumber);
    if (code) {
      await CodeResets.create({ phoneNumber, code });
    }

    return newUser;
  },

  activePhoneNumber: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::activePhoneNumber' + JSON.stringify(args));
    let { phoneNumber, code } = args;

    // check required fields
    if (!phoneNumber || !code) {
      throw new Error('Vui lòng cung câp mã code');
    }

    // convert phone number to vietnam phone number
    phoneNumber = await smsUtils.convertPhoneNumber(phoneNumber);

    // check if user already exists
    const user = await Accounts.findOne({ phoneNumber });

    if (!user) {
      throw new Error('Số điện thoại không tồn tại trong hệ thống');
    }

    // check if user is active
    if (user.isActive) {
      throw new Error('Số điện thoại đã được xác thực');
    }

    // check if code is correct
    const codeReset = await CodeResets.findOne({ phoneNumber, code });
    if (!codeReset) {
      throw new Error('Code không đúng');
    }

    // check if code is expired
    const timeExpired = new Date(codeReset.updatedAt).getTime() + LIMIT_TIME_SEND_SMS;
    const currentTime = new Date().getTime();
    if (timeExpired < currentTime) {
      throw new Error('Code đã hết hạn');
    }

    // active phone number
    await Accounts.findByIdAndUpdate(user._id, { isActive: true });

    // delete code reset
    await CodeResets.findByIdAndDelete(codeReset._id);

    // create token
    const token = await jwtUtils.encodeToken({ id: user.id });

    return { token, user };

  },


  login: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::login' + JSON.stringify(args));
    let { phoneNumber, password } = args;

    // check required fields
    if (!phoneNumber || !password) {
      throw new Error('Vui lòng nhập đủ thông tin');
    }

    // convert phone number to vietnam phone number
    phoneNumber = await smsUtils.convertPhoneNumber(phoneNumber);

    // check if user exists
    const user = await Accounts.findOne({ phoneNumber, isDeleted: false });
    if (!user) {
      throw new Error('Số điện thoại không khớp với tài khoản nào');
    }

    // check if password is correct
    const isPasswordCorrect = await bcryptUtils.comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('Sai mật khẩu');
    }

    // check if user is active
    if (!user.isActive) {
      throw new Error('Số điện thoại chưa được xác thực');
    }

    // update lastLogin
    await Accounts.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // create token
    const token = await jwtUtils.encodeToken(_.pick(user, ['id', 'phoneNumber', 'role']));

    return { token, user };
  },

  getCodePhoneNumber: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::getCodePhoneNumber' + JSON.stringify(args));
    let { phoneNumber } = args;

    // check required fields
    if (!phoneNumber) {
      throw new Error('Vui lòng cung cấp số điện thoại');
    }

    // convert phone number to Vietnam format
    phoneNumber = smsUtils.convertPhoneNumber(phoneNumber);

    // check if user exists
    const user = await Accounts.findOne({ phoneNumber });

    if (!user) {
      throw new Error('Số điện thoại không tồn tại trong hệ thống');
    }

    // check if phone has been sent before
    const isSent = await CodeResets.findOne({ phoneNumber });

    if (isSent) {
      //  check 1 minutes send sms
      const timeDiff = new Date() - isSent.updatedAt;

      if (timeDiff < LIMIT_TIME_SEND_SMS) {
        throw new Error('Chúng tôi đã gửi mã, vui lòng đợi 2 phút để nhận lại mã');
      } else {
        // send sms active phone number
        const code = await smsUtils.sendCodePhoneActive(phoneNumber);
        if (!code) {
          throw new Error('Gửi mã xác thực thất bại');
        }

        await CodeResets.findByIdAndUpdate(isSent._id, { code });
      }

    } else {
      // send sms active phone number
      const code = await smsUtils.sendCodePhoneActive(phoneNumber);
      if (!code) {
        throw new Error('Gửi mã xác thực thất bại');
      }

      await CodeResets.create({ phoneNumber, code });
    }

    return true;
  },

  activeCodeReset: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::activeCodeReset' + JSON.stringify(args));
    let { phoneNumber, code } = args;

    // check required fields
    if (!phoneNumber || !code) {
      throw new Error('Please provide a phone number and code');
    }

    // convert phone number to Vietnam format
    phoneNumber = smsUtils.convertPhoneNumber(phoneNumber);

    // check if phone has been sent before
    const isSent = await context.db.CodeResets.findOne({ where: { phoneNumber, code } });

    if (!isSent) {
      throw new Error('Code không đúng');
    }

    // check code expired 1 minutes
    const timeDiff = new Date() - isSent.updatedAt;
    if (timeDiff > LIMIT_TIME_SEND_SMS) {
      throw new Error('Code đã hết bạn');
    }

    return true;
  },

}

export default authenticationMutation;