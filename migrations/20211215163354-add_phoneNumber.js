module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    // check account has role and add phone number

    const accounts = await db.collection('account').find({}).toArray();

    for (let account of accounts) {
      if (account.role.includes('shipper')) {
        await db.collection('shipper').updateOne({ accountId: account._id }, { $set: { phoneNumber: account.phoneNumber } });
      }

      if (account.role.includes('vendor')) {
        await db.collection('vendor').updateOne({ accountId: account._id }, { $set: { phoneNumber: account.phoneNumber } });
      }

      if (account.role.includes('buyer')) {
        await db.collection('buyer').updateOne({ accountId: account._id }, { $set: { phoneNumber: account.phoneNumber } });
      }
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
