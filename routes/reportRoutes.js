const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportsController");
const verifyJWT = require("../middleware/verifyJWT");

router.route("/").post(verifyJWT, reportController.createReport);

module.exports = router;
