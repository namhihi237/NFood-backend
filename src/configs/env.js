require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'dev';

export const envVariable = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || '123456',
  CLOUD_NAME: process.env.CLOUD_NAME || 'do-an-cnpm',
  API_KEY_CLOUD: process.env.API_KEY_CLOUD || '484176915684615',
  API_SECRET_CLOUD: process.env.API_SECRET_CLOUD || 'hpWWOxyc-cm_Egs5bqRF4UzPJf8',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || 'ACb2d52449e35d5f226ac43b0127f786a3',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '50c6b40bef4cd6e0bb3a064172cd0651',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '+17043438846',
  FIREBASE_URL: process.env.FIREBASE_URL || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb+srv://cnpm:cnpm17t1@cluster0.n1nom.mongodb.net/food?retryWrites=true&w=majority',
  EMAIL: process.env.EMAIL || 'poppy99.dev@gmail.com',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || 'namvippro23799@',
  clientUrl: NODE_ENV == 'stg' ? process.env.CLIENT_URL : 'http://localhost/',
  expireTime: process.env.expireTime || 30 * 24 * 60 * 60 * 1000,
  HERE_API_KEY: process.env.HERE_API_KEY || 'LGvxySLz8X9PIDMLkB9wvBuzY_6wB3M2stKDZdYxe6Q',
};
