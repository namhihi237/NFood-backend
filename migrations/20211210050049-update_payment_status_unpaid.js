module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    console.log('update_payment_status_unpaid');
    await db.collection('order').updateMany({ paymentStatus: 'Pending' }, { $set: { paymentStatus: 'Unpaid' } });
    await db.collection('order').updateMany({}, { $set: { paymentMethod: 'COD' } });
    // delete paymentType
    await db.collection('order').updateMany({}, { $unset: { paymentType: '' } });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
