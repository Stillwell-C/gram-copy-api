const {
  findNotifications,
  countNotifications,
} = require("../service/notification.services");

const getNotifications = async (req, res) => {
  const { page, limit } = req.query;
  const reqID = req.reqID;

  const notifications = await findNotifications(page, limit, reqID);

  if (!notifications.length) {
    return res.status(400).json({ message: "No notifications found" });
  }

  const totalNotifications = await countNotifications(reqID);

  if (page && limit) {
    totalPages = math.ceil(totalNotifications / limit);
    return res.json({ notifications, totalNotifications, limit, totalPages });
  }

  res.json({ notifications, totalNotifications });
};

module.exports = { getNotifications };
