import { bcryptUtils, emailUtils, jwtUtils, smsUtils } from '../../../utils';
import { Accounts, CodeResets } from "../../../models";

import _ from 'lodash';
const LIMIT_TIME_SEND_SMS = 2 * 60 * 1000;

const authenticationMutation = {
  register: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::register' + JSON.stringify(args));
    let { phoneNumber, fullName, password, role } = args;

    // check required fields
    if (!phoneNumber || !fullName || !password) {
      throw new Error('Please provide an phone number, full name and password');
    }

    // convert phone number to vietnam phone number
    phoneNumber = await smsUtils.convertPhoneNumber(phoneNumber);

    // check if user already exists
    const user = await Accounts.findOne({ phoneNumber });

    if (user) {
      throw new Error('Phone number already exists');
    }

    const hashPassword = await bcryptUtils.hashPassword(password);

    // create user
    const newUser = await Accounts.create({ phoneNumber, password: hashPassword, role });

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
      throw new Error('Please provide an phone number and code');
    }

    // convert phone number to vietnam phone number
    phoneNumber = await smsUtils.convertPhoneNumber(phoneNumber);

    // check if user already exists
    const user = await Accounts.findOne({ phoneNumber });

    if (!user) {
      throw new Error('Phone number not exists');
    }

    // check if user is active
    if (user.isActive) {
      throw new Error('Phone number already active');
    }

    // check if code is correct
    const codeReset = await CodeResets.findOne({ phoneNumber, code });
    if (!codeReset) {
      throw new Error('Code is incorrect');
    }

    // check if code is expired
    const timeExpired = new Date(codeReset.updatedAt).getTime() + LIMIT_TIME_SEND_SMS;
    const currentTime = new Date().getTime();
    if (timeExpired < currentTime) {
      throw new Error('Code is expired');
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
      throw new Error('Please provide phone and password');
    }

    // convert phone number to vietnam phone number
    phoneNumber = await smsUtils.convertPhoneNumber(phoneNumber);

    // check if user exists
    const user = await Accounts.findOne({ phoneNumber, isDeleted: false });
    if (!user) {
      throw new Error('Phone number does not exist');
    }

    // check if password is correct
    const isPasswordCorrect = await bcryptUtils.comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('Password is incorrect');
    }

    // check if user is active
    if (!user.isActive) {
      throw new Error('User is not active!');
    }

    // update lastLogin
    await Accounts.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // create token
    const token = await jwtUtils.encodeToken(_.pick(user, ['id']));

    return { token, user };
  },

  getCodePhoneNumber: async (parent, args, context, info) => {
    global.logger.info('authenticationMutation::getCodePhoneNumber' + JSON.stringify(args));
    let { phoneNumber } = args;

    // check required fields
    if (!phoneNumber) {
      throw new Error('Please provide a phone number');
    }

    // convert phone number to Vietnam format
    phoneNumber = smsUtils.convertPhoneNumber(phoneNumber);

    // check if user exists
    const user = await Accounts.findOne({ phoneNumber });

    if (!user) {
      throw new Error('Phone number does not exist');
    }

    // check if phone has been sent before
    const isSent = await CodeResets.findOne({ phoneNumber });

    if (isSent) {
      //  check 1 minutes send sms
      const timeDiff = new Date() - isSent.updatedAt;

      if (timeDiff < LIMIT_TIME_SEND_SMS) {
        throw new Error('We has send code, please wait 2 minutes to send sms again');
      } else {
        // send sms active phone number
        const code = await smsUtils.sendCodePhoneActive(phoneNumber);
        if (!code) {
          throw new Error('Send sms code phone number failed');
        }

        await CodeResets.findByIdAndUpdate(isSent._id, { code });
      }

    } else {
      // send sms active phone number
      const code = await smsUtils.sendCodePhoneActive(phoneNumber);
      if (!code) {
        throw new Error('Send sms code phone number failed');
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
      throw new Error('Code is incorrect');
    }

    // check code expired 1 minutes
    const timeDiff = new Date() - isSent.updatedAt;
    if (timeDiff > LIMIT_TIME_SEND_SMS) {
      throw new Error('Code is expired');
    }

    return true;
  },

}

export default authenticationMutation;