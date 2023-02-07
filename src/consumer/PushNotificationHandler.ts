import {
    Errors,
    FirebaseConfiguration,
    FirebaseType,
    Kafka,
    MethodEnum,
    NotificationMessage,
} from 'common';
import { ObjectMapper } from 'jackson-js';
import { Service } from 'typedi';
import config from '../Config';
import IPushNotificationRequest from '../models/request/IPushNotificationRequest';
import NotificationModel from '../models/schema/NotificationModel';
import { Increment } from 'mongoose-auto-increment-ts';

@Service()
export default class PushNotificationHandler {
    public init() {
        const handle: Kafka.KafkaRequestHandler = new Kafka.KafkaRequestHandler(
            Kafka.getInstance()
        );
        Kafka.createConsumer(
            config,
            config.kafkaConsumerOptions,
            [config.topic.push_notification],
            (message: Kafka.IKafkaMessage) => handle.handle(message, this.handleRequest),
            config.kafkaTopicOptions
        );
    }

    private handleRequest: Kafka.Handle = async (message: Kafka.IMessage) => {
        if (message == null || message.data == null) {
            return Promise.reject(new Errors.SystemError());
        } else {
            let request = <IPushNotificationRequest>message.data;
            let notificationMessage: NotificationMessage = new NotificationMessage();
            notificationMessage.setMethod(MethodEnum.FIREBASE);
            await Promise.all([
                this.saveMessage(request),
                this.pushNotificationByUserName(
                    notificationMessage,
                    request,
                    message.messageId.toString()
                )
            ]);
        }
        return false;
    };

    private async pushNotificationByUserName(
        notificationMessage: NotificationMessage,
        pushNotificationRequest: IPushNotificationRequest,
        transactionId: string | number
    ) {
        const objectMapper: ObjectMapper = new ObjectMapper();
        let firebaseConfiguration: FirebaseConfiguration = new FirebaseConfiguration();
        if (pushNotificationRequest.type == FirebaseType.TOKEN) {
            firebaseConfiguration.setToken(pushNotificationRequest.token);
        } else {
            firebaseConfiguration.setCondition(pushNotificationRequest.condition);
        }
        firebaseConfiguration.setType(pushNotificationRequest.type);
        firebaseConfiguration.setNotification({
            title: pushNotificationRequest.title,
        });
        firebaseConfiguration.setData({ click_action: 'FLUTTER_NOTIFICATION_CLICK' });
        let data: string = pushNotificationRequest.content;
        let template: Map<string, Object> = new Map<string, Object>([
            [pushNotificationRequest.template, data],
        ]);
        notificationMessage.setConfiguration(firebaseConfiguration, objectMapper);
        notificationMessage.setTemplate(template);
        Kafka.getInstance().sendMessage(
            transactionId.toString(),
            config.clusterId,
            '',
            notificationMessage
        );
    }

    private async saveMessage(pushNotificationRequest: IPushNotificationRequest) {
        if (pushNotificationRequest.isSave) {
            const _id: number = await Increment('c_notifications');
            NotificationModel.create({
                _id: _id,
                userId: pushNotificationRequest.userId,
                title: pushNotificationRequest.title,
                content: pushNotificationRequest.content,
                isRead: false,
            });
        }
    }
}
