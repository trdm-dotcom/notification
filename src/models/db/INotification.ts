export interface INotification {
    _id?: string;
    userId?: string;
    title?: string;
    content?: string;
    isRead?: Boolean;
    createAt?: Date;
    updateAt?: Date;
    deletedAt?: Date;
}