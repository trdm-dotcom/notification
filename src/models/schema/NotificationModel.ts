import { model, Schema } from 'mongoose';
import { INotification } from '../db/INotification';

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: String },
        title: {type: String},
        content: {type: String},
        isRead: {type: Boolean, default: false},
        deletedAt: {type: Date},
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
);

export default model<INotification>('c_notifications', NotificationSchema);
