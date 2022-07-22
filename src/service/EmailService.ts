import { EmailConfiguration, Errors, NotificationMessage, Logger, Utils } from "common";
import { getTemplate } from '../utils/Utils';
import {ObjectMapper} from 'jackson-js';
import IEmailRequest from "../models/request/IEmailRequest";
import { Service } from "typedi";

@Service()
export default class EmailService{
    private objectMapper: ObjectMapper;

    public sendEmail(notificationMessage: NotificationMessage)  {
        const invalidParams = new Errors.InvalidParameterError();
        Utils.validate(notificationMessage.getTemplate(), 'template').setRequire().throwValid(invalidParams);
        invalidParams.throwErr();
        try {
            let emailConfiguration :EmailConfiguration = notificationMessage.parseConfiguration<EmailConfiguration>(this.objectMapper);
            let emailRequest: IEmailRequest = {
                toList: emailConfiguration.getToList(),
                bccList: emailConfiguration.getBccList(),
                ccList: emailConfiguration.getCcList(),
                from: emailConfiguration.getFrom(),
                subject: emailConfiguration.getSubject(),
            }
            notificationMessage.getTemplate().forEach((templateData: Object, template: string) => {
                let templateName: string =  `${template}.ejs`;
                let content: string | null = getTemplate(templateName, notificationMessage.getLocale(), templateData);
                if(!content){
                    Logger.error(`NOT EXIST TEMPLATE OF ${templateName}`);
                }
                emailRequest.content = content;
            });
        } catch (error) {
            
        }
    } 
}