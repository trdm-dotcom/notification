export interface IUser {
    _id?: string;
    username?: string;
    password?: string;
    phoneNumber?: string;
    email?: string;
    isVerified?: boolean;
    deviceToken?: string;
    createAt?: Date;
    updateAt?: Date;  
}