import 'reflect-metadata';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { Logger, Kafka, createService } from 'common';
import { Container } from 'typedi';
import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import ManangerNotificationHandler from './consumer/ManangerNotificationHandler';
import mongoose from 'mongoose';
import PushNotificationHandler from './consumer/PushNotificationHandler';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

function init() {
    try {
        Logger.info('run service notification');
        mongoose.set("strictQuery", false);
        mongoose.connect(config.mongo.url, config.mongo.options).then(() => {
            Logger.info('connected to mongo!');
        });
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
        Promise.all([
            createService(Kafka.getInstance(), {
                serviceName: config.clusterId,
                nodeId: config.clientId,
                listeningTopic: config.topic.manager_notification,
            }),
            createService(Kafka.getInstance(), {
                serviceName: config.clusterId,
                nodeId: config.clientId,
                listeningTopic: config.topic.push_notification,
            }),
        ]);
        Promise.all([
            Container.get(RequestHandler).init(),
            Container.get(ManangerNotificationHandler).init(),
            Container.get(PushNotificationHandler).init(),
        ]);
    } catch (error) {
        Logger.error(error);
        process.exit(1);
    }
}

init();
