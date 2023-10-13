import 'reflect-metadata';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { Logger } from 'common';
import { Container } from 'typedi';
import admin from 'firebase-admin';
import { initKafka } from './service/KafkaProducerService';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

async function run() {
  Logger.info('run service notification');
  initKafka();
  const serviceAccount = require('../../fotei-71604-firebase-adminsdk-ofd5j-4fea71109a.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  Container.get(RequestHandler).init();
}

run().catch((error) => {
  Logger.error(error);
  process.exit(1);
});
