import {Errors, NotificationMessage, Logger, Utils, SmsConfiguration } from "common";
import { Service } from "typedi";
import ISmsRequest from "../models/request/ISmsRequest";
import { getTemplate } from "../utils/Utils";
import {ObjectMapper} from 'jackson-js';
import 'dotenv/config'
import { Twilio } from "twilio";

@Service()
export default class SmsService{
    private objectMapper: ObjectMapper;

    public sendSms(notificationMessage: NotificationMessage)  {
        const twilio: Twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const invalidParams = new Errors.InvalidParameterError();
        Utils.validate(notificationMessage.getTemplate(), 'template').setRequire().throwValid(invalidParams);
        invalidParams.throwErr();
        try {
            let smsConfiguration: SmsConfiguration = notificationMessage.parseConfiguration<SmsConfiguration>(this.objectMapper);
            let smsRequest: ISmsRequest = {
                phoneNumber: smsConfiguration.getPhoneNumber()
            }
            notificationMessage.getTemplate().forEach(async (templateData: Object, template: string) => {
                let templateName: string =  `${template}.ejs`;
                let content: string | null = getTemplate(templateName, notificationMessage.getLocale(), templateData);
                if(!content){
                    Logger.error(`NOT EXIST TEMPLATE OF ${templateName}`);
                }
                smsRequest.content = content;
                let response = await twilio.messages.create({
                    from: process.env.FROM_PHONE_NUMBER,
                    to: smsRequest.phoneNumber,
                    body: smsRequest.content
                }); 
                Logger.info('Send SMS response: ', response);
            });
        } catch (error) {
            
        }
    } 
}