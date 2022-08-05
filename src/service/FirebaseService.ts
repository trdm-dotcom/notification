import { Errors, Logger, NotificationMessage, Utils } from 'common';
import { JsonParser } from 'jackson-js';
import { Service } from 'typedi';
import { getTemplate } from '../utils/Utils';
import admin from 'firebase-admin';
import { FirebaseConfiguration } from 'common';

@Service()
export class FirebaseService {
    public pushMessage(notificationMessage: NotificationMessage) {
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
            map.forEach((templateData: Object = 'push_up', template: string) => {
                let content: string | null = getTemplate(template, templateData);
                if (!content) {
                    Logger.error(`NOT EXIST TEMPLATE OF ${template}`);
                }
                let notification = {
                    ...firebaseConfiguration.getNotification(),
                    ...{
                        body: content,
                    },
                };
                let message = {
                    token: firebaseConfiguration.getToken(),
                    topic: firebaseConfiguration.getTopic(),
                    condition: firebaseConfiguration.getCondition(),
                    android: firebaseConfiguration.getAndroid(),
                    apns: firebaseConfiguration.getApns(),
                    webpush: firebaseConfiguration.getWebpush(),
                    notification: notification,
                    data: firebaseConfiguration.getData()
                };
                Logger.info(message);
                admin
                    .messaging()
                    .send(message)
                    .then((response) => {
                        Logger.info('Message sent: ', response);
                    });
            });
        } catch (error) {
            Logger.error(error);
        }
    }
}
