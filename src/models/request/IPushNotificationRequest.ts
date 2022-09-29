import { FirebaseType } from 'common';

export default interface IPushNotificationRequest {
    userId?: string;
    title?: string;
    content?: string;
    template?: string;
    isSave?: boolean;
    type?: FirebaseType;
    token?: string;
    condition?: string;
}
