module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    // get all orders
    const orders = await db.collection('order').find({}).toArray();
    const VENDOR_PERCENT_PER_ORDER = 0.8;
    const SHIPPING_RATES_PER_ORDER = 0.8;
    orders.forEach(async (order) => {
      // add field 
      const totalForVendor = parseFloat((order.subTotal - order.discount) * VENDOR_PERCENT_PER_ORDER).toFixed(2);
      const totalForSystem = parseFloat((order.subTotal - order.discount) * (1 - VENDOR_PERCENT_PER_ORDER) + order.shipping * (1 - SHIPPING_RATES_PER_ORDER)).toFixed(2);
      const totalForShipment = parseFloat(order.shipping * (1 - SHIPPING_RATES_PER_ORDER)).toFixed(2);

      await db.collection('order').updateOne({ _id: order._id }, { $set: { totalForVendor, totalForSystem, totalForShipment } });
    });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
