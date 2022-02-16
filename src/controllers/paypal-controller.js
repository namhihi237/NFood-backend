import { paypal, HttpError } from '../utils';
import { Accounts, Buyer, Vendor, Shipper, Transaction, Cart, Order } from '../models';
const EXCHANGE_RATE = 0.000044;
import orderService from "../modules/order/orderService";
import { notificationService } from "../modules/notification";
import { envVariable } from '../configs';
import mongoose from 'mongoose';
import _ from 'lodash';

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
            payment: payment
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async chargeOrderSuccess(req, res, next) {
    global.logger.info(req.body);

    const paymentId = req.query.paymentId;
    const PayerID = req.query.PayerID;
    const { userId, promoCode } = req.query;

    global.logger.info(JSON.stringify(req.query));

    try {

      const buyer = await Buyer.findOne({ accountId: userId });

      // find all items in the cart
      const cartItems = await Cart.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'item', localField: 'itemId', foreignField: '_id', as: 'item' } },
        { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } }
      ]);

      const vendorId = _.uniq(_.map(cartItems, 'item.vendorId'))[0];
      const vendor = await Vendor.findOne({ _id: vendorId });

      // check timeOpen
      const timeOpen = vendor.timeOpen;
      let currentTime = new Date();
      currentTime.setHours(currentTime.getHours() + 7);
      const currentDay = currentTime.getDay();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();

      // convert currentDay to string
      let currentDayString = "";
      if (currentDay === 0) {
        currentDayString = "8";
      } else {
        currentDayString = (currentDay + 1).toString();
      }

      // check timeOpen
      const timeOpenItem = _.find(timeOpen, { day: currentDayString, isOpen: true });
      if (!timeOpenItem) {
        throw new Error("Cửa hàng này hiện không mở cửa");
      }

      // check timeOpen
      const start = parseFloat(timeOpenItem.openTime.getHours() + "." + timeOpenItem.openTime.getMinutes());
      const end = parseFloat(timeOpenItem.closeTime.getHours() + "." + timeOpenItem.closeTime.getMinutes());
      const current = parseFloat(currentHour + "." + currentMinute);
      if (current < start || current > end) {
        throw new HttpError("Cửa hàng này hiện không mở cửa", 400);
      }

      // calculate total price
      let subTotal = 0;
      cartItems.forEach(cartItem => {
        subTotal += cartItem.item.price * cartItem.quantity;
      });

      // calculate shipping fee
      let shipping = await orderService.calculateShippingCost(userId, vendorId);
      // calculate discount
      let discount = 0;
      if (promoCode) {
        discount = await orderService.calculateDiscount(vendorId, buyer._id, promoCode, subTotal);
        if (!discount) {
          promoCode = null;
          discount = 0;
        }
      }

      // calculate total price
      let total = subTotal + shipping - discount;

      // calculate delivery time base on distance
      let now = new Date();
      let estimatedDeliveryTime = new Date(now.getTime() + (5 * 1000));


      let orderItems = [];
      cartItems.forEach(cartItem => {
        orderItems.push({
          itemId: cartItem.item._id,
          buyerId: buyer._id,
          buyerName: buyer.name,
          name: cartItem.item.name,
          quantity: cartItem.quantity,
          price: cartItem.item.price,
          note: cartItem.note,
          image: cartItem.item.image
        })
      });


      let amount = 0;
      paypal.payment.get(paymentId, (err, payment) => {
        if (err) {
          throw new HttpError('Error some error occurred', 500);
        }
        amount = payment.transactions[0].amount.total;

        global.logger.info('userId payer:' + userId);

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

        paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
          if (error) throw new HttpError(error.message, 500);

          const invoiceNumber = await orderService.generateInvoiceNumber();

          // create order
          await Order.create({
            ownerId: buyer._id,
            vendorId,
            name: buyer.name,
            address: buyer.address,
            phoneNumber: buyer.phoneNumber,
            invoiceNumber,
            discount,
            shipping,
            subTotal,
            promoCode,
            infoPaypal: {
              paymentId: payment.id,
              payerId: payment.payer.payer_info.payer_id,
              email: payment.payer.payer_info.email,
              amount: parseFloat(payment.transactions[0].amount.total),
              currency: payment.transactions[0].amount.currency,
            },
            total,
            estimatedDeliveryTime,
            orderItems,
            paymentMethod: 'CRE',
            paymentStatus: 'Paid',
            location: {
              type: 'Point',
              coordinates: [vendor.location.coordinates[0], vendor.location.coordinates[1]]
            }
          });

          await Cart.deleteMany({ userId });

          return res.render(`api/paypal/success`);
        });
      });
    } catch (error) {
      next(error);
    }
  }

  async chargeOrderCancel(req, res, next) {
    return res.render(`${this.rootModule}cancel`, {
      titlePage: 'cancel'
    });
  }

  async createChargeOrder(req, res, next) {
    global.logger.info('PayPalController::chargeOrder' + JSON.stringify(req.body));
    const { promoCode } = req.body;

    try {
      const buyer = await Buyer.findOne({ accountId: req.user.id });

      // find all items in the cart
      const cartItems = await Cart.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(req.user.id) } },
        { $lookup: { from: 'item', localField: 'itemId', foreignField: '_id', as: 'item' } },
        { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } }
      ]);

      if (cartItems.length == 0) {
        throw new HttpError("Bạn không có món ăn nào trong giỏ", 400);
      }
      const vendorId = _.uniq(_.map(cartItems, 'item.vendorId'))[0];

      const vendor = await Vendor.findOne({ _id: vendorId });

      // check vendor is ready to accept order
      if (!vendor.isReceiveOrder) {
        throw new HttpError("Cửa hàng này hiện không nhận đơn hàng", 400);
      }

      // calculate total price
      let subTotal = 0;
      cartItems.forEach(cartItem => {
        subTotal += cartItem.item.price * cartItem.quantity;
      });

      // calculate shipping fee
      let shipping = await orderService.calculateShippingCost(req.user.id, vendorId);
      // calculate discount
      let discount = 0;
      if (promoCode) {
        discount = await orderService.calculateDiscount(vendorId, buyer._id, promoCode, subTotal);
        if (!discount) {
          promoCode = null;
          discount = 0;
        }
      }

      // calculate total price
      let total = subTotal + shipping - discount;

      // convert to USD
      const amount = parseFloat(total * EXCHANGE_RATE).toFixed(2);

      const creat_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: `${req.protocol}://${req.get('host')}/api/v1/payment/charge-success?userId=${req.user.id}&promoCode=${promoCode}&vendorId=${vendorId}`,
          cancel_url: `${req.protocol}://${req.get('host')}/api/v1/payment/charge-cancel`
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

      paypal.payment.create(creat_payment_json, (err, payment) => {
        if (err) {
          throw new HttpError(err.message, 500);
        }
        // res.redirect(payment.links[1].href);
        res.status(200).json({
          message: 'Payment success',
          status: 200,
          ok: true,
          url: payment.links[1].href,
          payment: payment
        });
      });

    } catch (error) {
      global.logger.error('PayPalController::chargeOrder' + error);
      next(error);
    }
  }

  async deposit(req, res, next) {
    global.logger.info('PayPalController::deposit' + JSON.stringify(req.body));
    const { amount, type } = req.body;

    try {
      // validate amount
      if (!amount || amount <= 0) {
        throw new HttpError('Amount is invalid', 400);
      }

      if (type === 'shipper') {
        const shipper = await Shipper.findOne({ accountId: req.user.id });
        if (!shipper) {
          throw new HttpError('Shipper not found', 404);
        }
      } else if (type === 'buyer') {
        const buyer = await Buyer.findOne({ accountId: req.user.id });
        if (!buyer) {
          throw new HttpError('Buyer not found', 404);
        }
      }

      const amountUSD = parseFloat(amount * EXCHANGE_RATE).toFixed(2);

      const creat_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: `${req.protocol}://${req.get('host')}/api/v1/payment/deposit-success?userId=${req.user.id}&type=${type}&amount=${amount}`,
          cancel_url: `${req.protocol}://${req.get('host')}/api/v1/payment/deposit-cancel`
        },
        transactions: [{
          item_list: {
            items: [{
              name: 'item',
              sku: 'item',
              price: `${amountUSD}`,
              currency: 'USD',
              quantity: 1
            }]
          },
          amount: {
            currency: 'USD',
            total: `${amountUSD}`
          },
          description: 'This is the deposit description.'
        }]
      }

      paypal.payment.create(creat_payment_json, (err, payment) => {
        if (err) {
          throw new HttpError(err.message, 500);
        }

        res.status(200).json({
          message: 'deposit success',
          status: 200,
          ok: true,
          url: payment.links[1].href,
          payment: payment
        });
      });

    }
    catch (error) {
      next(error);
    }
  }

  async depositSuccess(req, res, next) {
    try {
      const { userId, type, amount } = req.query;

      const paymentId = req.query.paymentId;
      const payerId = req.query.PayerID;

      // get payment
      paypal.payment.get(paymentId, (err, payment) => {
        if (err) {
          throw new HttpError('Error some error occurred', 500);
        }
        const amountUSD = payment.transactions[0].amount.total;

        const execute_payment_json = {
          payer_id: payerId,
          transactions: [
            {
              amount: {
                currency: "USD",
                total: `${amountUSD}`
              }
            }
          ]
        };

        paypal.payment.execute(paymentId, execute_payment_json, async (err, payment) => {
          if (err) {
            throw new HttpError('Error some error occurred', 500);
          }

          if (type === 'shipper') {
            const shipper = await Shipper.findOneAndUpdate({ accountId: userId }, { $inc: { money: amount } });

            await Transaction.create({
              userId: shipper._id,
              type: 'deposit',
              amount: amount,
              status: 'success',
              currency: 'VND',
            });
          } else if (type === 'buyer') {
            const buyer = await Buyer.findOneAndUpdate({ accountId: userId }, { $inc: { money: amount } });

            await Transaction.create({
              userId: buyer._id,
              type: 'deposit',
              amount: amount,
              status: 'success',
              currency: 'VND',
            });
          }

          return res.render(`api/paypal/success`);
        });
      });


    } catch (error) {
      next(error);
    }
  }


}

export default PayPalController;