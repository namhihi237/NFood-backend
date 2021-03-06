require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'dev';

export const envVariable = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || '',
  CLOUD_NAME: process.env.CLOUD_NAME || '',
  API_KEY_CLOUD: process.env.API_KEY_CLOUD || '',
  API_SECRET_CLOUD: process.env.API_SECRET_CLOUD || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || 'A',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  FIREBASE_URL: process.env.FIREBASE_URL || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  EMAIL: process.env.EMAIL || 'poppy99.dev@gmail.com',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  clientUrl: NODE_ENV == 'stg' ? process.env.CLIENT_URL : 'http://localhost/',
  expireTime: process.env.expireTime || 30 * 24 * 60 * 60 * 1000,
  HERE_API_KEY: process.env.HERE_API_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
  // API_DOMAIN: process.env.API_DOMAIN || 'https://nfood-api.southeastasia.cloudapp.azure.com',
  API_DOMAIN: process.env.API_DOMAIN || 'http://localhost:8000',
};
