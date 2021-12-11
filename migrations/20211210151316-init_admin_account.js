const bcrypt = require('bcrypt');
module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    console.log('Migration: init_admin_account');

    const password = await bcrypt.hash('123456', 10);

    const admin = await db.collection('admin').findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      await db.collection('admin').insertOne({
        email: 'admin@gmail.com',
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        role: 'admin',
      });
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
