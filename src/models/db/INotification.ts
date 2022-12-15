export interface INotification {
    _id?: string;
    userId?: number;
    title?: string;
    content?: string;
    isRead?: Boolean;
    createAt?: Date;
    updateAt?: Date;
    deletedAt?: Date;
}