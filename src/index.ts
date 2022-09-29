import 'reflect-metadata';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { Logger, Kafka } from 'common';
import { Container } from 'typedi';
import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import ManangerNotificationHandler from './consumer/ManangerNotificationHandler';
import mongoose from 'mongoose';
import PushNotificationHandler from './consumer/PushNotificationHandler';

Logger.create(config.logger.config, true);
Logger.info('Starting...');

async function init() {
    Logger.info('run service notification');
    mongoose.connect(config.mongo.url, config.mongo.options)
    .then(() => {Logger.info("connected to mongo!")});
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
    const requestHandler = await Container.get(RequestHandler);
    await requestHandler.init();
    await Kafka.getInstance().sendMessage("", config.topic.manager_notification, "", "");
    const managerNofitication = await Container.get(ManangerNotificationHandler);
    await managerNofitication.init();
    await Kafka.getInstance().sendMessage("", config.topic.push_notification, "", "");
    const pushNotification = await Container.get(PushNotificationHandler);
    await pushNotification.init();
    const serviceAccount = JSON.parse(readFileSync(config.firebase.authKey, 'utf-8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

init()
    .then()
    .catch((error: any) => {
        Logger.error(error);
        process.exit(1);
    });
