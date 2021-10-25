import nodemailer from 'nodemailer';
import { envVariable } from '../configs';
import randomUtils from './random';
import jwtUtils from './jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
class EmailUtils {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: envVariable.EMAIL,
        pass: envVariable.EMAIL_PASSWORD,
      },
    });

    this.templatePath = path.normalize(`${process.cwd()}/views/email-templates/`);
  }

  async sendEmail(options) {
    const mailOptions = {
      from: envVariable.EMAIL,
      to: options.email,
      subject: options.subject,
      html: options.html
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendEmailActive(options) {
    let templateFile = '/api/active-user.ejs';

    const token = await jwtUtils.encodeToken({ id: options.id });
    // render HTML from file path
    const html = await ejs.renderFile(`${this.templatePath}${templateFile}`, {
      templatePath: this.templatePath,
      activeLink: `${envVariable.clientUrl}verify-email?token=${token}`
    }, {
      filename: 'active-user'
    });

    options.subject = 'Active your account';
    options.html = html;
    return this.sendEmail(options);
  }
}

export default new EmailUtils();