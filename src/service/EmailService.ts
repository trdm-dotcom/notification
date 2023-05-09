import { EmailConfiguration, Errors, NotificationMessage, Logger } from 'common';
import { getTemplate } from '../utils/Utils';
import { JsonParser } from 'jackson-js';
import IEmailRequest from '../models/IEmailRequest';
import { Service } from 'typedi';
import { createTransport } from 'nodemailer';
import Config from '../Config';

@Service()
export default class EmailService {
  public sendEmail(notificationMessage: NotificationMessage, transactionId: string | number) {
    const transporter = createTransport(Config.app.email);
    const jsonParser = new JsonParser();
    const emailConfiguration: EmailConfiguration = jsonParser.transform(
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
    const map = new Map(Object.entries(notificationMessage.getTemplate()));
    map.forEach(async (templateData: Object, template: string) => {
      try {
        const text: string | null = getTemplate(template, templateData);
        if (text != null) {
          emailRequest.text = text;
        } else {
          Logger.error(`${transactionId} NOT EXIST LIQUID TEMPLATE OF ${template}`);
        }
        const html: string | null = getTemplate(`${template}.html`, templateData);
        if (html != null) {
          emailRequest.html = html;
        } else {
          Logger.error(`${transactionId} NOT EXIST HTML TEMPLATE OF ${template}`);
        }
        if (html == null && text == null) {
          throw new Errors.GeneralError(`${transactionId} NOT EXIST TEMPLATE OF ${template}`);
        }
        await transporter.sendMail({
          from: emailRequest.from,
          to: emailRequest.toList,
          cc: emailRequest.ccList,
          bcc: emailRequest.bccList,
          subject: emailRequest.subject,
          html: emailRequest.html,
          text: emailRequest.text,
        });
      } catch (err) {
        Logger.error(`${transactionId} send email error`, err);
      }
    });
  }
}
