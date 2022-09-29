import { IDataRequest } from "./IDataRequest";

export default interface IRemarkNotificationRequest extends IDataRequest {
    notificationId?: Array<string>;
}