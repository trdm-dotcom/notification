import { EmailConfiguration, Errors, NotificationMessage, Logger, Utils } from 'common';
import { getTemplate } from '../utils/Utils';
import { JsonParser } from 'jackson-js';
import IEmailRequest from '../models/request/IEmailRequest';
import { Service } from 'typedi';
import { createTransport } from 'nodemailer';
import Config from '../Config';

@Service()
export default class EmailService {
    public sendEmail(notificationMessage: NotificationMessage) {
        const transporter = createTransport(Config.app.email);
        const jsonParser = new JsonParser();
        const invalidParams = new Errors.InvalidParameterError();
        Utils.validate(notificationMessage.getTemplate(), 'template')
            .setRequire()
            .throwValid(invalidParams);
        invalidParams.throwErr();
        try {
            let emailConfiguration: EmailConfiguration = jsonParser.transform(
                JSON.parse(notificationMessage.getConfiguration()),
                {
                    mainCreator: () => [EmailConfiguration],
                }
            );
            let emailRequest: IEmailRequest = {
                toList: emailConfiguration.getToList(),
                bccList: emailConfiguration.getBccList(),
                ccList: emailConfiguration.getCcList(),
                from: emailConfiguration.getFrom(),
                subject: emailConfiguration.getSubject(),
            };
            let map = new Map(Object.entries(notificationMessage.getTemplate()));
            map.forEach((templateData: Object, template: string) => {
                let text: string | null = getTemplate(template, templateData);
                if (text) {
                    emailRequest.text = text;
                } else {
                    Logger.error(`NOT EXIST LIQUID TEMPLATE OF ${template}`);
                }

                let html: string | null = getTemplate(`${template}.html`, templateData);
                if (html) {
                    emailRequest.html = html;
                } else {
                    Logger.error(`NOT EXIST HTML TEMPLATE OF ${template}`);
                }
                
                let response = transporter.sendMail({
                    from: emailRequest.from,
                    to: emailRequest.toList,
                    cc: emailRequest.ccList,
                    bcc: emailRequest.bccList,
                    subject: emailRequest.subject,
                    html: emailRequest.html,
                    text: emailRequest.text,
                });
                Logger.info('Message sent: ', response);
            });
        } catch (error) {
            Logger.error(error);
        }
    }
}
