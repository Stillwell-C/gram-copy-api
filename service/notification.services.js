const Notification = require("../models/Notification");

const findNotifications = async (page, limit, reqID) => {
  const pageInt = parseInt(page) || 1;
  const limitInt = parseInt(limit) || 10;

  const skipInt = (pageInt - 1) * limitInt;

  return Notification.find({ notifiedUser: reqID })
    .sort("-createdAt")
    .limit(limitInt)
    .skip(skipInt)
    .lean()
    .populate("notifyingUser", "_id username userImgKey")
    .exec();
};

const countNotifications = async (reqID) => {
  return Notification.countDocuments({ notifiedUser: reqID });
};

const createNotification = async ({ ...notificationData }) => {
  return Notification.create({ ...notificationData });
};

module.exports = { findNotifications, countNotifications, createNotification };
