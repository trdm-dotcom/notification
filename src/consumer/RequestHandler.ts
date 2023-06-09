import { Inject, Service } from 'typedi';
import { Errors, Models, Logger, Utils } from 'common';
import config from '../Config';
import SmsService from '../service/SmsService';
import EmailService from '../service/EmailService';
import { JsonParser } from 'jackson-js';
import { FirebaseService } from '../service/FirebaseService';
import { Kafka } from 'kafka-common';
import { getInstance } from '../service/KafkaProducerService';

@Service()
export default class RequestHandler {
  @Inject()
  private smsService: SmsService;

  @Inject()
  private emailService: EmailService;

  @Inject()
  private firebaseService: FirebaseService;

  public init() {
    const handle: Kafka.KafkaRequestHandler = new Kafka.KafkaRequestHandler(getInstance());
    new Kafka.KafkaConsumer(config).startConsumer(
      [config.clusterId],
      (message: Kafka.MessageSetEntry) => handle.handle(message, this.handleRequest)
    );
  }

  private handleRequest: Kafka.Handle = async (message: Kafka.IMessage) => {
    Logger.info(`Endpoint received message: ${JSON.stringify(message)}`);
    const jsonParser = new JsonParser();
    if (message == null || message.data == null) {
      return Promise.reject(new Errors.SystemError());
    } else {
      let notificationMessage: Models.NotificationMessage = jsonParser.transform(message.data, {
        mainCreator: () => [Models.NotificationMessage],
      });
      let invalidParams = new Errors.InvalidParameterError();
      Utils.validate(notificationMessage.getTemplate(), 'template')
        .setRequire()
        .throwValid(invalidParams);
      invalidParams.throwErr();
      switch (notificationMessage.getMethod()) {
        case Models.MethodEnum.EMAIL:
          return this.emailService.sendEmail(notificationMessage, message.transactionId);
        case Models.MethodEnum.SMS:
          return this.smsService.sendSms(notificationMessage, message.transactionId);
        case Models.MethodEnum.FIREBASE:
          return this.firebaseService.pushMessage(notificationMessage, message.transactionId);
      }
      return false;
    }
  };
}
