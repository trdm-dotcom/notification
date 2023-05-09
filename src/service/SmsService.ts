import { Errors, NotificationMessage, Logger, SmsConfiguration } from 'common';
import { Service } from 'typedi';
import { getTemplate } from '../utils/Utils';
import { JsonParser } from 'jackson-js';
import 'dotenv/config';
import { Twilio } from 'twilio';

@Service()
export default class SmsService {
  public sendSms(notificationMessage: NotificationMessage, transactionId: string | number) {
    const jsonParser = new JsonParser();
    const twilio: Twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    const smsConfiguration: SmsConfiguration = jsonParser.transform(
      JSON.parse(notificationMessage.getConfiguration()),
      {
        mainCreator: () => [SmsConfiguration],
      }
    );
    const phoneNumber = smsConfiguration.getPhoneNumber();
    const map = new Map(Object.entries(notificationMessage.getTemplate()));
    map.forEach(async (templateData: Object, template: string) => {
      try {
        const content: string | null = getTemplate(template, templateData);
        if (content == null) {
          Logger.error(`${transactionId} NOT EXIST TEMPLATE OF ${template}`);
          throw new Errors.GeneralError(`${transactionId} NOT EXIST TEMPLATE OF ${template}`);
        }
        await twilio.messages.create({
          from: process.env.FROM_PHONE_NUMBER,
          to: phoneNumber,
          body: content,
        });
      } catch (error) {
        Logger.error(`${transactionId} send sms error`, error);
      }
    });
  }
}
