const TIME_OPEN_DEFAULT = [
  {
    day: '2',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '3',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '4',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '5',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '6',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '7',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
    isOpen: true,
  },
  {
    day: '8',
    openTime: new Date('2020-01-01T08:00:00.000Z'),
    closeTime: new Date('2020-01-01T20:00:00.000Z'),
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
