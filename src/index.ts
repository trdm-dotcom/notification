import 'reflect-metadata';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { Logger } from 'common';
import { Container } from 'typedi';
import { initKafka } from './service/KafkaProducerService';
import admin from 'firebase-admin';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

const serviceAccount = require('../fotei.json');

const firebaseApp: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const getFirebaseApp = () => {
  return firebaseApp;
};

async function run() {
  Logger.info('run service notification');
  initKafka();
  Container.get(RequestHandler).init();
}

run().catch((error) => {
  Logger.error(error);
  process.exit(1);
});
