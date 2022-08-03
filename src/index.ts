import 'reflect-metadata';
import config from './Config';
import RequestHandler from './consumer/RequestHandler';
import { Logger, Kafka } from 'common';
import { Container } from 'typedi';

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
        {},
      );
    const requestHandler = Container.get(RequestHandler);
    requestHandler.init();
}

init()
    .then()
    .catch((error: any) => {
        Logger.error(error);
        process.exit(1);
    });
