import { Inject, Service } from 'typedi';
import { Errors, Kafka, NotificationMessage, MethodEnum} from 'common';
import Config from '../Config';
import SmsService from '../service/SmsService';
import EmailService from '../service/EmailService';
import { ObjectMapper } from 'jackson-js';

@Service()
export default class RequestHandler {
    @Inject()
    private smsService: SmsService;

    @Inject()
    private emailService: EmailService;

    @Inject()
    private objectMapper: ObjectMapper;

    public init() {
        const handle: Kafka.MessageHandler = new Kafka.MessageHandler(Kafka.getInstance());
        new Kafka.ConsumerHandler(
            Config,
            Config.kafkaConsumerOptions,
            Config.requestHandlerTopics,
            (message: any) => handle.handle(message, this.handleRequest),
            Config.kafkaTopicOptions
        );
    }

    private handleRequest: Kafka.Handle = async (message: Kafka.IMessage) => {
        if (message == null || message.data == null) {
            return Promise.reject(new Errors.SystemError());
        } else {
            let notificationMessage: NotificationMessage = this.objectMapper.parse<NotificationMessage>(message.data);
            switch(notificationMessage.getMethod()){
                case MethodEnum.EMAIL:
                    return this.emailService.sendEmail(notificationMessage);
                case MethodEnum.SMS:
                    return this.smsService.sendSms(notificationMessage);
            }
        }
        return false;
    };
}
