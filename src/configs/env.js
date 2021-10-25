require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'dev';

export const envVariable = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || '123456',
  CLOUD_NAME: process.env.CLOUD_NAME || '',
  API_KEY_CLOUD: process.env.API_KEY_CLOUD || '',
  API_SECRET_CLOUD: process.env.API_SECRET_CLOUD || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  FIREBASE_URL: process.env.FIREBASE_URL || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:namvippro23799@localhost:3306/food',
  EMAIL: process.env.EMAIL || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  clientUrl: NODE_ENV == 'stg' ? process.env.CLIENT_URL : 'http://localhost/',
  expireTime: process.env.expireTime || 30 * 24 * 60 * 60 * 1000,
};
