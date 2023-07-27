const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");

router
  .route("/")
  .post(followController.createFollow)
  .delete(followController.deleteFollow);

router.route("/:id/followers").get(followController.getAllFollowers);

router.route("/:id/following").get(followController.getAllFollowing);

module.exports = router;
