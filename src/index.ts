import 'reflect-metadata';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { Logger, Kafka } from 'common';
import { Container } from 'typedi';
import { readFileSync } from 'fs';
import admin from 'firebase-admin';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

async function init() {
    Logger.info('run service notification');
    await Kafka.create(
        config,
        true,
        null,
        {
            serviceName: config.clusterId,
            nodeId: config.nodeId,
        },
        config.kafkaProducerOptions,
        {},
        config.kafkaConsumerOptions,
        {}
    );
    const requestHandler = Container.get(RequestHandler);
    requestHandler.init();
    const serviceAccount = JSON.parse(readFileSync(config.firebase.authKey, 'utf-8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: config.firebase.databaseURL,
    });
}

init()
    .then()
    .catch((error: any) => {
        Logger.error(error);
        process.exit(1);
    });
