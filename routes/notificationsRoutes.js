const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const verifyJWT = require("../middleware/verifyJWT");

router.route("/").get(verifyJWT, notificationsController.getNotifications);

module.exports = router;
