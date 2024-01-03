const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .post(verifyJWT, followController.createFollow)
  .delete(verifyJWT, followController.deleteFollow);

router.route("/:id/followers").get(followController.getAllFollowers);

router.route("/:id/followers/count").get(followController.getFollowerCount);

router.route("/:id/following").get(followController.getAllFollowing);

router.route("/:id/following/count").get(followController.getFollowingCount);

router.route("/user/:id").get(verifyJWT, followController.getFollow);

module.exports = router;
