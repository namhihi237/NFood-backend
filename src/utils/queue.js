import Queue from 'bee-queue';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Accounts, Order, Buyer, Vendor, Shipper, Category, Item } from "../models";
const Redis = require('ioredis');
import _ from 'lodash';
const options = {
  host: '127.0.0.1',
  port: 6379,
  retryStrategy: times => {
    return Math.min(times * 50, 2000);
  }
};

class BeeQueue {
  constructor() {
    this.pubsub = new RedisPubSub({
      publisher: new Redis(options),
      subscriber: new Redis(options),
    });

    this.queue = new Queue('notify-shipper', {
      redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 0,
        options: {},
      },
      isWorker: true,
    });

    this.queue.process(async (job, done) => {
      global.logger.info(`Processing job ==============${job.id}`);
      return done(null,
        await this.randomShipperForOrder(job.data)
      );
    });
  }

  async randomShipperForOrder(orderId) {
    logger.info('randomShipperForOrder::orderId: ' + orderId);

    let order = await Order.findOne({ _id: orderId });

    let vendor = await Vendor.findById({ _id: order.vendorId });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // check status of order is pending
    if (order.orderStatus !== 'Pending') {
      throw new Error('Đơn hàng đã được xử lý');
    }

    // add vendor for order
    order = JSON.parse(JSON.stringify(order));
    vendor = JSON.parse(JSON.stringify(vendor));

    order = {
      ...order,
      vendor: {
        ...vendor,
        coordinates: vendor.location.coordinates
      }
    }
    global.logger.info('randomShipperForOrder::order: ' + JSON.stringify(order));

    // find shipper near to vendor
    let shippers = await Shipper.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [vendor.location.coordinates[0], vendor.location.coordinates[1]]
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: 30000,
        }
      },
      {
        $match: {
          isShippingOrder: true,
          isActive: true,
          isDeleted: false,
          isReceiveOrder: false,
        }
      }
    ]);
    logger.info('randomShipperForOrder::shippers: ' + JSON.stringify(shippers));

    // remove shipper has distance > maxReceiveOrderDistance
    shippers = shippers.filter(shipper => {
      return shipper.maxReceiveOrderDistance * 1000 >= shipper.distance;
    });

    global.logger.info('shippers:: ' + JSON.stringify(shippers));

    if (shippers.length === 0) {
      global.logger.info('sleep 30s===========================' + orderId);
      // sleep for 30s and try again
      function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

      await sleep(30000);

      return this.randomShipperForOrder(orderId);
    }

    // random shipper
    const randomShipper = _.sample(shippers);

    // push shipper to order subscription
    this.pubsub.publish(`ORDER_SHIPPING_${randomShipper.accountId}`, { orderShipping: order });
  }

}

export default new BeeQueue();