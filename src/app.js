import { ApolloServer } from 'apollo-server-express';
import { createServer } from "http";
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import _ from 'lodash';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import session from "express-session";
import redis from "redis";
import conectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import typeDefs from './schemaGraphql';
import resolvers from './modules';
import { envVariable } from './configs';
import { logger, jwtUtils, connectDb } from './utils';
import { Accounts } from "./models";
import { adminRouter } from './routers';
import { RedisPubSub } from 'graphql-redis-subscriptions';
const Redis = require('ioredis');
const pathServer = '/api/v1/graphql';

const options = {
  host: '127.0.0.1',
  port: 6379,
  retryStrategy: times => {
    return Math.min(times * 50, 2000);
  }
};

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

// setup session storage
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
  db: 0
});


const RedisStore = conectRedis(session);
const redisStore = new RedisStore({
  client: redisClient
});


export const startServer = async () => {
  const app = express();

  const httpServer = createServer(app);

  app.use(session({
    secret: 'z5l1c9dpSD', // random key
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAgeRemember: 30 * 24 * 60 * 60 * 1000, // 30 days
    resave: false,
    saveUninitialized: true,
    store: redisStore
  }));

  //config routes api
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false, limit: '20mb', parameterLimit: 100 }));
  app.use(express.static(path.join(process.cwd(), './src/public')));
  app.use(cookieParser());

  app.use('/', adminRouter());

  // view engine setup
  app.set('views', path.join(process.cwd(), './src/views'));
  app.set('view engine', 'ejs');

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    async onConnect(connectionParams, webSocket, context) {
      console.log('Connected!');
      let token = null,
        user = null;
      token = connectionParams.Authorization;
      try {
        user = await jwtUtils.verify(token);
      } catch (error) {
      }

      return { user, pubsub };
    },
    onDisconnect(webSocket, context) {
      console.log('Disconnected!')
    },
  }, {
    server: httpServer,
    path: pathServer,
  });

  const server = new ApolloServer({
    schema,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        }
      }
    }],
    introspection: true,
    playground: true,
    path: pathServer,
    context: async ({ req }) => {
      let token = null,
        user = null;
      token = req.headers.authorization ? req.headers.authorization : null;
      try {
        user = await jwtUtils.verify(token);

        user = await Accounts.findById(user.data.id, { id: 1, phoneNumber: 1, role: 1 });
      } catch (error) {
      }

      return { user, pubsub };
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: pathServer });

  global.logger = logger;

  connectDb(envVariable.DATABASE_URL);

  httpServer.listen({ port: envVariable.PORT }, () => {
    logger.info(`Server run environment ${process.env.NODE_ENV || "dev"}`)
    logger.info(`🚀 Server ready at http://localhost:${envVariable.PORT}${server.graphqlPath}`);
  });
};

startServer();