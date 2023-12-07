import { Errors, Logger, Models } from 'common';
import { JsonParser } from 'jackson-js';
import { Service } from 'typedi';
import { getTemplate } from '../utils/Utils';
import {
  ConditionMessage,
  MulticastMessage,
  TopicMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import { getFirebaseApp } from '..';

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
    const map = new Map(Object.entries(notificationMessage.getTemplate()));
    map.forEach(async (templateData: Object, template: string = 'push_up') => {
      try {
        const content: string | null = await getTemplate(template, templateData);
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
        const result = await this.doPushNotiFirebase(firebaseConfiguration, notification);
        Logger.info(`${transactionId} send push notification result`, result);
      } catch (err) {
        Logger.error(`${transactionId} send push notification error`, err);
      }
    });
  }

  private doPushNotiFirebase(
    firebaseConfiguration: Models.FirebaseConfiguration,
    notification: object
  ): Promise<any> {
    switch (firebaseConfiguration.getType()) {
      case Models.FirebaseType.CONDITION: {
        const conditionMessage: ConditionMessage = {
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
        return getFirebaseApp().messaging().send(conditionMessage);
      }
      case Models.FirebaseType.TOKEN: {
        const tokensMessage: MulticastMessage = {
          tokens: firebaseConfiguration.getTokens(),
          android: firebaseConfiguration.getAndroid(),
          apns: firebaseConfiguration.getApns(),
          webpush: firebaseConfiguration.getWebpush(),
          notification: notification,
          data: {
            ...firebaseConfiguration.getData(),
            ...notification,
          },
        };
        return getFirebaseApp().messaging().sendEachForMulticast(tokensMessage);
      }
      case Models.FirebaseType.TOPIC: {
        const topicMessage: TopicMessage = {
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
        return getFirebaseApp().messaging().send(topicMessage);
      }
      default:
        throw new Errors.InvalidFieldValueError('type', firebaseConfiguration.getType());
    }
  }
}
