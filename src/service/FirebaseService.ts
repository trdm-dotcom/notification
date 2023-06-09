import { Errors, Logger, Models } from 'common';
import { JsonParser } from 'jackson-js';
import { Service } from 'typedi';
import { getTemplate } from '../utils/Utils';
import admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Service()
export class FirebaseService {
  public async pushMessage(
    notificationMessage: Models.NotificationMessage,
    transactionId: string | number
  ) {
    Logger.info(`${transactionId} push message`);
    const jsonParser = new JsonParser();
    const firebaseConfiguration: Models.FirebaseConfiguration = jsonParser.transform(
      JSON.parse(notificationMessage.getConfiguration()),
      {
        mainCreator: () => [Models.FirebaseConfiguration],
      }
    );
    let map = new Map(Object.entries(notificationMessage.getTemplate()));
    map.forEach(async (templateData: Object, template: string = 'push_up') => {
      try {
        const content: string | null = getTemplate(template, templateData);
        if (!content) {
          Logger.error(`${transactionId} NOT EXIST TEMPLATE OF ${template}`);
          throw new Errors.GeneralError(`${transactionId} NOT EXIST TEMPLATE OF ${template}`);
        }
        const notification = {
          ...firebaseConfiguration.getNotification(),
          ...{
            body: content,
          },
        };
        const message: Message = this.getObjectMessagePushNotiFirebase(
          firebaseConfiguration,
          notification
        );
        await admin.messaging().send(message);
      } catch (err) {
        Logger.error(`${transactionId} send push notification error`, err);
      }
    });
  }

  private getObjectMessagePushNotiFirebase(
    firebaseConfiguration: Models.FirebaseConfiguration,
    notification: object
  ): Message {
    switch (firebaseConfiguration.getType()) {
      case Models.FirebaseType.CONDITION:
        return {
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
      case Models.FirebaseType.TOKEN:
        return {
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
      case Models.FirebaseType.TOPIC:
        return {
          topic: firebaseConfiguration.getTopic(),
          android: firebaseConfiguration.getAndroid(),
          apns: firebaseConfiguration.getApns(),
          webpush: firebaseConfiguration.getWebpush(),
          notification: notification,
          data: {
            ...firebaseConfiguration.getData(),
            ...notification,
          },
        };
      default:
        throw new Errors.InvalidFieldValueError('type', firebaseConfiguration.getType());
    }
  }
}
