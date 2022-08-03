import { Inject, Service } from 'typedi';
import { Errors, Kafka, NotificationMessage, MethodEnum, Logger} from 'common';
import config from '../Config';
import SmsService from '../service/SmsService';
import EmailService from '../service/EmailService';
import { JsonParser } from 'jackson-js';

@Service()
export default class RequestHandler {
    @Inject()
    private smsService: SmsService;

    @Inject()
    private emailService: EmailService;

    public init() {
        const handle: Kafka.KafkaRequestHandler = new Kafka.KafkaRequestHandler(Kafka.getInstance());
        Kafka.createConsumer(
            config,
            config.kafkaConsumerOptions,
            config.requestHandlerTopics,
            (message: Kafka.IKafkaMessage) => handle.handle(message, this.handleRequest),
            config.kafkaTopicOptions
        );
    }

    private handleRequest: Kafka.Handle = async (message: Kafka.IMessage) => {
        const jsonParser = new JsonParser();
        if (message == null || message.data == null) {
            return Promise.reject(new Errors.SystemError());
        } else {
            Logger.info('Endpoint received message: ', message);
            let notificationMessage: NotificationMessage = jsonParser.transform(message.data, {
                mainCreator: () => [NotificationMessage]
            });            
            switch(notificationMessage.getMethod()){
                case MethodEnum.EMAIL:
                    return this.emailService.sendEmail(notificationMessage);
                case MethodEnum.SMS:
                    return this.smsService.sendSms(notificationMessage);
            }
            return false;
        }
    };
}
