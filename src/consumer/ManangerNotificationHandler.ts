import { Errors, Kafka } from "common";
import { Inject, Service } from "typedi";
import ManagerNotificationService from "../service/ManagerNotificationService";
import config from '../Config';

@Service()
export default class ManangerNotificationHandler{
    @Inject()
    private managerNotificationService: ManagerNotificationService;

    public init() {
        const handle: Kafka.KafkaRequestHandler = new Kafka.KafkaRequestHandler(Kafka.getInstance());
        Kafka.createConsumer(
            config,
            config.kafkaConsumerOptions,
            [config.topic.manager_notification],
            (message: Kafka.IKafkaMessage) => handle.handle(message, this.handleRequest),
            config.kafkaTopicOptions
        );
    }

    private handleRequest: Kafka.Handle = async (message: Kafka.IMessage) => {
        if (message == null || message.data == null) {
            return Promise.reject(new Errors.SystemError());
        } else {
            switch (message.uri){
                case 'put:/api/v1/notification/markAsRead':
                    return await this.managerNotificationService.remarkNotification(message.data, message.transactionId);

                case 'put:/api/v1/notification/deleteNoti':
                    return await this.managerNotificationService.deleteNotification(message.data, message.transactionId);

                case 'get:/api/v1/notification':
                    return await this.managerNotificationService.queryAll(message.data, message.transactionId);
                    
                case 'get:/api/v1/notification/numberOfUnreadNoti':
                    return await this.managerNotificationService.countUnreadNotifications(message.data, message.transactionId);
            }
        }
        return false;
    };
}