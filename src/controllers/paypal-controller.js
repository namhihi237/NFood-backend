import { paypal, HttpError } from '../utils';

class PayPalController {
  constructor(db) {
    this.db = db;
    this.rootModule = 'api/paypal/';
  }

  renderPayment(req, res) {
    res.render(`${this.rootModule}index`);
  }

  async payment(req, res, next) {

    const { amount } = req.body;
    const creat_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `${req.protocol}://${req.get('host')}/api/v1/payment/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/api/v1/payment/cancel`
      },
      transactions: [{
        item_list: {
          items: [{
            name: 'item',
            sku: 'item',
            price: `${amount}`,
            currency: 'USD',
            quantity: 1
          }]
        },
        amount: {
          currency: 'USD',
          total: `${amount}`
        },
        description: 'This is the payment description.'
      }]
    }

    try {
      paypal.payment.create(creat_payment_json, (err, payment) => {
        if (err) {
          throw new HttpError(err.message, 500);
        }
        res.redirect(payment.links[1].href);
      });

    } catch (error) {
      next(error);
    }
  }

  async success(req, res, next) {
    const paymentId = req.query.paymentId;
    const PayerID = req.query.PayerID;

    try {
      let amount = 0;
      paypal.payment.get(paymentId, (err, payment) => {
        if (err) {
          throw new HttpError(err.message, 500);
        }
        amount = payment.transactions[0].amount.total;

        const execute_payment_json = {
          payer_id: PayerID,
          transactions: [
            {
              amount: {
                currency: "USD",
                total: `${amount}`
              }
            }
          ]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
          if (error) throw new HttpError(error.message, 500);
          res.status(200).json({
            message: 'Payment success',
            status: 200,
            ok: true,
            payment
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PayPalController;