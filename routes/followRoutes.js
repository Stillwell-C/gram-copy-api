const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .post(verifyJWT, followController.createFollow)
  .delete(verifyJWT, followController.deleteFollow);

router.route("/:id/followers").get(followController.getAllFollowers);

router.route("/:id/following").get(followController.getAllFollowing);

module.exports = router;
