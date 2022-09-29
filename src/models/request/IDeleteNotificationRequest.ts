import { IDataRequest } from "./IDataRequest";

export default interface IDeleteNotificationRequest extends IDataRequest{
    notificationId?: Array<string>;
}