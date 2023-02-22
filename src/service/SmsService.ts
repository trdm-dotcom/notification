import { Errors, NotificationMessage, Logger, SmsConfiguration } from 'common';
import { Service } from 'typedi';
import ISmsRequest from '../models/request/ISmsRequest';
import { getTemplate } from '../utils/Utils';
import { JsonParser } from 'jackson-js';
import 'dotenv/config';
import { Twilio } from 'twilio';

@Service()
export default class SmsService {
    public sendSms(notificationMessage: NotificationMessage, transactionId: string | number) {
        Logger.info(`${transactionId} sms`);
        const jsonParser = new JsonParser();
        const twilio: Twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        let smsConfiguration: SmsConfiguration = jsonParser.transform(
            JSON.parse(notificationMessage.getConfiguration()),
            {
                mainCreator: () => [SmsConfiguration],
            }
        );
        let smsRequest: ISmsRequest = {
            phoneNumber: smsConfiguration.getPhoneNumber(),
        };
        let map = new Map(Object.entries(notificationMessage.getTemplate()));
        map.forEach((templateData: Object, template: string) => {
            let content: string | null = getTemplate(template, templateData);
            if (!content) {
                Logger.error(`${transactionId} NOT EXIST TEMPLATE OF ${template}`);
                throw new Errors.GeneralError(`${transactionId} NOT EXIST TEMPLATE OF ${template}`);
            }
            smsRequest.content = content;
            twilio.messages.create({
                from: process.env.FROM_PHONE_NUMBER,
                to: smsRequest.phoneNumber,
                body: smsRequest.content,
            });
        });
    }
}
