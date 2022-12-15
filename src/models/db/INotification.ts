export interface INotification {
    _id?: number;
    userId?: number;
    title?: string;
    content?: string;
    isRead?: Boolean;
    createAt?: Date;
    updateAt?: Date;
    deletedAt?: Date;
}