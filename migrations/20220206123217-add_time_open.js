const TIME_OPEN_DEFAULT = [
  {
    day: '2',
    openTime: 8,
    closeTime: 22,
    isOpen: true,
  },
  {
    day: '3',
    openTime: 8,
    closeTime: 22,
    isOpen: true,
  },
  {
    day: '4',
    openTime: 8,
    closeTime: 22,
    isOpen: true,
  },
  {
    day: '5',
    openTime: 8,
    closeTime: 22,
    isOpen: true,
  },
  {
    day: '6',
    openTime: 8,
    closeTime: 22,
    isOpen: true,
  },
  {
    day: '7',
    openTime: 8,
    closeTime: 22,
    isOpen: true,
  },
  {
    day: '8',
    openTime: 8,
    closeTime: 22,
    isOpen: true,
  },
];
module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    // add timeOpen default to vendor
    const vendors = await db.collection('vendor').find({}).toArray();

    for (let i = 0; i < vendors.length; i += 1) {
      await db.collection('vendor').updateOne({ _id: vendors[i]._id }, { $set: { timeOpen: TIME_OPEN_DEFAULT } });
    }

  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
