import { Errors, Logger, Utils } from 'common';
import mongoose from 'mongoose';
import { Service } from 'typedi';
import Constants from '../Constants';
import { Period } from '../models/enum/Period';
import IDeleteNotificationRequest from '../models/request/IDeleteNotificationRequest';
import IQueryNotificationRequest from '../models/request/IQueryNotificationRequest';
import IUnreadNotificationsRequest from '../models/request/IUnreadNotificationsRequest';
import NotificationModel from '../models/schema/NotificationModel';
import * as moment from 'moment';
import IRemarkNotificationRequest from '../models/request/IRemarkNotificationRequest';

@Service()
export default class ManagerNotificationService {
    public async remarkNotification(
        request: IRemarkNotificationRequest,
        transactionId: string | number
    ) {
        const invalidParams = new Errors.InvalidParameterError();
        Utils.validate(request.notificationId, 'notificationId')
            .setRequire()
            .throwValid(invalidParams);
        invalidParams.throwErr();
        let conn = mongoose.connection;
        let session = await conn.startSession();
        try {
            await NotificationModel.updateMany(
                {
                    $and: [
                        { userId: { $in: request.notificationId } },
                        { isRead: false },
                        { deletedAt: null },
                    ],
                },
                { $set: { isRead: true } },
                { session: session }
            );
            await session.commitTransaction();
        } catch (error) {
            Logger.error(`${transactionId} error ${error}`);
            await session.abortTransaction();
            throw new Errors.GeneralError(Constants.REMARK_NOTIFICATION_FAIL);
        } finally {
            session.endSession();
        }
        return {
            status: Constants.REMARK_NOTIFICATION_SUCCESS,
        };
    }

    public async deleteNotification(
        request: IDeleteNotificationRequest,
        transactionId: string | number
    ) {
        let notificationIds: Array<string> = request.notificationId;
        Logger.info(
            `${transactionId} delete notification user ${request.headers.token.userData.id} ids ${notificationIds}`
        );
        let now: Date = new Date();
        let conn = mongoose.connection;
        let session = await conn.startSession();
        try {
            if (notificationIds == null || notificationIds.length < 1) {
                await NotificationModel.updateMany(
                    { userId: request.headers.token.userData.id },
                    { $set: { deletedAt: now } },
                    { session: session }
                );
            } else {
                await NotificationModel.updateMany(
                    { userId: { $in: request.notificationId } },
                    { $set: { isRead: now } },
                    { session: session }
                );
            }
            await session.commitTransaction();
        } catch (error) {
            Logger.error(`${transactionId} error ${error}`);
            await session.abortTransaction();
            throw new Errors.GeneralError(Constants.DELETE_NOTIFICATION_FAIL);
        } finally {
            session.endSession();
        }
        return {
            status: Constants.DELETE_NOTIFICATION_SUCCESS,
        };
    }

    public async queryAll(request: IQueryNotificationRequest, transactionId: string | number) {
        let userId: string = request.headers.token.userData.id;
        Logger.info(
            `${transactionId} query all notification user ${userId} option ${request.option}`
        );
        let now: Date = new Date();
        if (request.option == null) {
            request.option = Period.ALL;
        }
        let fetchCount =
            request.pageSize != null && request.pageSize > 0
                ? request.pageSize
                : Constants.DEFAULT_FETCH_COUNT;
        let offset =
            request.pageNumber != null ? Math.max(0, request.pageNumber) : Constants.DEFAULT_OFFSET;
        switch (request.option) {
            case Period.DAY:
                return await NotificationModel.find({
                    $and: [
                        { userId: userId },
                        {
                            date: {
                                $gte: moment(Utils.subtractTime(now, 1, 'day'))
                                    .startOf('hour')
                                    .toDate(),
                                $lte: moment(now).toDate(),
                            },
                        },
                    ],
                })
                    .limit(fetchCount)
                    .skip(offset * fetchCount)
                    .sort({ date: 'desc' });
            case Period.WEEK:
                return await NotificationModel.find({
                    $and: [
                        { userId: userId },
                        {
                            date: {
                                $gte: moment(Utils.subtractTime(now, 1, 'week'))
                                    .startOf('hour')
                                    .toDate(),
                                $lte: moment(now).toDate(),
                            },
                        },
                    ],
                })
                    .limit(fetchCount)
                    .skip(offset * fetchCount)
                    .sort({ date: 'desc' });
            case Period.MONTH:
                return await NotificationModel.find({
                    $and: [
                        { userId: userId },
                        {
                            date: {
                                $gte: moment(Utils.subtractTime(now, 1, 'month'))
                                    .startOf('hour')
                                    .toDate(),
                                $lte: moment(now).toDate(),
                            },
                        },
                    ],
                })
                    .limit(fetchCount)
                    .skip(offset * fetchCount)
                    .sort({ date: 'desc' });
            case Period.YEAR:
                return await NotificationModel.find({
                    $and: [
                        { userId: userId },
                        {
                            date: {
                                $gte: moment(Utils.subtractTime(now, 1, 'year'))
                                    .startOf('hour')
                                    .toDate(),
                                $lte: moment(now).toDate(),
                            },
                        },
                    ],
                })
                    .limit(fetchCount)
                    .skip(offset * fetchCount)
                    .sort({ date: 'desc' });
            case Period.ALL:
                return await NotificationModel.find({ userId: userId })
                    .limit(fetchCount)
                    .skip(offset * fetchCount)
                    .sort({ date: 'desc' });
        }
    }

    public async countUnreadNotifications(
        request: IUnreadNotificationsRequest,
        transactionId: string | number
    ) {
        let userId: String = request.headers.token.userData.id;
        Logger.info(`${transactionId} count unread notification user ${userId}`);
        let countedUnread: number = await NotificationModel.count({
            $and: [{ userId: userId }, { isRead: false }, { deletedAt: null }],
        });
        return {
            countedUnread: countedUnread,
        };
    }
}
