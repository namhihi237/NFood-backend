import { envVariable } from '../configs';
import twilio from 'twilio';
import randomUtils from './random';

class SMSUtils {
  constructor() {
    this.client = new twilio(envVariable.TWILIO_ACCOUNT_SID, envVariable.TWILIO_AUTH_TOKEN);
  }

  async sendCodePhoneActive(phoneNumber) {
    global.logger.info('SMSUtils::sendCodePhoneActive ' + phoneNumber);
    const code = randomUtils.randomNumber(4);
    try {
      await this.client.messages
        .create({
          body: `Your code is ${code}`,
          to: phoneNumber,
          from: envVariable.TWILIO_PHONE_NUMBER,
        });
      return code;
    } catch (error) {
      console.log(error);
      global.logger.error(error);
      return null;
    }
  }

  convertPhoneNumber(phoneNumber) {
    // convert phoneNumber to +84xxxxxxxxxx
    return phoneNumber.replace(/^0/g, '+84');
  }
}

export default new SMSUtils();