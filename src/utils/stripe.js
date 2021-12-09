
import Stripe from 'stripe';
import { envVariable } from '../configs';
class Stripe {
  constructor() {
    this.stripe = Stripe(envVariable.STRIPE_SECRET_KEY);
  }

  async createCustomer(email = 'nfood app', source) {
    global.logger.info('Stripe createCustomer' + JSON.stringify({ email, source }));
    let description = `Customer for ${email}`;

    try {
      const customer = await this.stripe.customers.create({
        email,
        description,
      });

      const card = await this.stripe.customers.createSource(customer.id, { source });

      return {
        customer,
        card,
      };
    } catch (error) {
      global.logger.error('Stripe createCustomer error' + JSON.stringify({ error }));
    }
  };

  async deleteCustomer(customerId) {
    global.logger.info('Stripe deleteCustomer' + JSON.stringify({ customerId }));
    try {
      return await this.stripe.customers.del(customerId);
    } catch (error) {
      global.logger.error('Stripe deleteCustomer error' + JSON.stringify({ error }));
    }
  }

  async retrieveToken(token) {
    try {
      global.logger.info('Stripe retrieveToken' + JSON.stringify({ token }));

      return this.stripe.tokens.retrieve(token);
    } catch (error) {
      global.logger.error('Stripe retrieveToken error' + JSON.stringify({ error }));
    }
  }

  async createCharge(amount, currency, source, description, customerId) {
    try {
      global.logger.info('Stripe createCharge' + JSON.stringify({ amount, currency, source, description, customerId }));

      return this.stripe.charges.create(
        {
          amount,
          currency,
          source,
          description,
          customer: customerId,
        },
      )
    } catch (error) {
      global.logger.error('Stripe createCharge error' + JSON.stringify({ error }));
    }
  }

  retrieveBalanceTransaction(transactionId) {
    try {
      global.logger.info('Stripe retrieveBalanceTransaction' + JSON.stringify({ transactionId }));

      return this.stripe.balance.retrieveTransaction(transactionId);
    } catch (error) {
      global.logger.error('Stripe retrieveBalanceTransaction error' + JSON.stringify({ error }));
    }
  }

  createRefund(chargeId, amount, reason) {
    try {
      global.logger.info('Stripe createRefund' + JSON.stringify({ chargeId, amount, reason }));

      return this.stripe.refunds.create({
        charge: chargeId,
        amount,
        reason,
      });
    } catch (error) {
      global.logger.error('Stripe createRefund error' + JSON.stringify({ error }));
    }
  }

  async createTokenForTesting() {
    try {
      global.logger.info('Stripe createTokenForTesting');
      return await this.stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2023,
          cvc: '123',
        },
      });
    } catch (error) {
      global.logger.error('Stripe createTokenForTesting error' + JSON.stringify({ error }));
    }
  }
}

export default new Stripe();