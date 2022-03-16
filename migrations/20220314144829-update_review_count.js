module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    // get all vendor
    const vendors = await db.collection('vendor').find({}).toArray();
    // update numberOfReviews and rating
    vendors.forEach(async (vendor) => {
      const reviews = await db.collection('review').find({ reviewedId: vendor._id.toString() }).toArray();
      const numberOfReviews = reviews.length;
      const rating = reviews.filter(review => review.rating === 3).length;
      console.log(`rating: ${rating} , numberOfReviews: ${numberOfReviews}`);

      await db.collection('vendor').updateOne({ _id: vendor._id.toString() }, { $set: { numberOfReviews, rating } });
    });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
