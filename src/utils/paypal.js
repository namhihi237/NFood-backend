const paypal = require('paypal-rest-sdk');
import { envVariable } from '../configs';
paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id: envVariable.PAYPAL_CLIENT_ID,
  client_secret: envVariable.PAYPAL_CLIENT_SECRET,
});


export default paypal;