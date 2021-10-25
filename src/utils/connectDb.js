import mongoose from 'mongoose';

export default async (uri) => {
  try {
    logger.info(`Connect to: ${uri}`);
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    //set debug mongoose
    mongoose.set("debug", (collectionName, method, query, doc) => {
      global.logger.info(`${collectionName}.${method} :: ${JSON.stringify({ query, doc })}`);
    });

    const db = mongoose.connection;
    db.once('open', () => {
      global.logger.info(`Connected to database uri: ${uri}`);
    });
  } catch (error) {
    global.logger.error(`Connect to database faild: ${{ error }}`);
  }
};