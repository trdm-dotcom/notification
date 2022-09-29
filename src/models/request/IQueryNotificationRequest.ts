import { Period } from "../enum/Period";
import { IDataRequest } from "./IDataRequest";

export default interface IQueryNotificationRequest extends IDataRequest {
    date?: String;
    option?: Period;
    pageNumber?: number;
    pageSize?: number;
}