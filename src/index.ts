import 'reflect-metadata';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { Logger, Kafka } from 'common';
import { Container } from 'typedi';
import { readFileSync } from 'fs';
import admin from 'firebase-admin';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

function init() {
    try {
        Logger.info('run service notification');
        const serviceAccount = JSON.parse(readFileSync(config.firebase.authKey, 'utf-8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        Kafka.create(
            config,
            true,
            null,
            {
                serviceName: config.clusterId,
                nodeId: config.clientId,
            },
            config.kafkaProducerOptions,
            {},
            config.kafkaConsumerOptions,
            {}
        );
        Container.get(RequestHandler).init();
    } catch (error) {
        Logger.error(error);
        process.exit(1);
    }
}

init();
