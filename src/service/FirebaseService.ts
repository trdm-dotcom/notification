import { Errors, FirebaseType, Logger, NotificationMessage, Utils } from 'common';
import { JsonParser } from 'jackson-js';
import { Service } from 'typedi';
import { getTemplate } from '../utils/Utils';
import admin from 'firebase-admin';
import { FirebaseConfiguration } from 'common';

@Service()
export class FirebaseService {
    public async pushMessage(
        notificationMessage: NotificationMessage,
        transactionId: string | number
    ) {
        Logger.info(`${transactionId}  push message`);
        const jsonParser = new JsonParser();
        const invalidParams = new Errors.InvalidParameterError();
        Utils.validate(notificationMessage.getTemplate(), 'template')
            .setRequire()
            .throwValid(invalidParams);
        invalidParams.throwErr();
        try {
            let firebaseConfiguration: FirebaseConfiguration = jsonParser.transform(
                JSON.parse(notificationMessage.getConfiguration()),
                {
                    mainCreator: () => [FirebaseConfiguration],
                }
            );
            let map = new Map(Object.entries(notificationMessage.getTemplate()));
            map.forEach((templateData: Object, template: string = 'push_up') => {
                let content: string | null = getTemplate(template, templateData);
                if (!content) {
                    Logger.error(`NOT EXIST TEMPLATE OF ${template}`);
                    return;
                }
                let notification = {
                    ...firebaseConfiguration.getNotification(),
                    ...{
                        body: content,
                    },
                };
                switch (firebaseConfiguration.getType()) {
                    case FirebaseType.CONDITION:
                        let messageCondition = {
                            condition: firebaseConfiguration.getCondition(),
                            android: firebaseConfiguration.getAndroid(),
                            apns: firebaseConfiguration.getApns(),
                            webpush: firebaseConfiguration.getWebpush(),
                            notification: notification,
                            data: {
                                ...firebaseConfiguration.getData(),
                                ...notification,
                            },
                        };
                        admin
                            .messaging()
                            .send(messageCondition)
                            .then((response) => {
                                Logger.info(`${transactionId} message sent ${response}`);
                            })
                            .catch((error) => {
                                Logger.error(`${transactionId} send firebase noti error ${error}`);
                            });
                        break;
                    default:
                        let messageToken = {
                            token: firebaseConfiguration.getToken(),
                            android: firebaseConfiguration.getAndroid(),
                            apns: firebaseConfiguration.getApns(),
                            webpush: firebaseConfiguration.getWebpush(),
                            notification: notification,
                            data: {
                                ...firebaseConfiguration.getData(),
                                ...notification,
                            },
                        };
                        admin
                            .messaging()
                            .send(messageToken)
                            .then((response) => {
                                Logger.info(`${transactionId} message sent ${response}`);
                            })
                            .catch((error) => {
                                Logger.error(`${transactionId} send firebase noti error ${error}`);
                            });
                        break;
                }
            });
        } catch (error) {
            Logger.error(`${transactionId} error ${error}`);
        }
    }
}
