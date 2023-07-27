import 'dotenv/config';
import { Utils } from 'common';

let Config = {
    clusterId: 'notification',
    clientId: `notification-${Utils.getEnvNum('ENV_NODE_ID', 0)}`,
    nodeId: Utils.getEnvNum('ENV_NODE_ID', 0),
    kafkaUrls: Utils.getEnvArr('ENV_KAFKA_URLS', ['localhost:9092']),
    kafkaCommonOptions: {},
    kafkaConsumerOptions: {},
    kafkaProducerOptions: {},
    kafkaTopicOptions: {},
    requestHandlerTopics: [],
    app: {
        template: {
            dir: 'template/',
        },
        email: {
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: process.env.EMAIL_APP,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        },
    },
    firebase: {
        authKey: 'external/homer.json',
    },
    topic: {
        otp: 'otp',
        user_info: 'user-info',
    },
    logger: {
        config: {
            appenders: {
                application: { type: 'console' },
                file: {
                    type: 'file',
                    filename: './../logs/notification/application.log',
                    compression: true,
                    maxLogSize: 10485760,
                    backups: 100,
                },
            },
            categories: {
                default: { appenders: ['application', 'file'], level: 'info' },
            },
        },
    },
};

Config.kafkaConsumerOptions = {
    ...(Config.kafkaCommonOptions ? Config.kafkaCommonOptions : {}),
    ...(Config.kafkaConsumerOptions ? Config.kafkaConsumerOptions : {}),
};
Config.kafkaProducerOptions = {
    ...(Config.kafkaCommonOptions ? Config.kafkaCommonOptions : {}),
    ...(Config.kafkaProducerOptions ? Config.kafkaProducerOptions : {}),
};

if (Config.requestHandlerTopics.length === 0) {
    Config.requestHandlerTopics.push(Config.clusterId);
}

export default Config;
