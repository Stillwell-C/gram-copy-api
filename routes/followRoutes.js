const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");

router
  .route("/")
  .post(followController.createFollow)
  .delete(followController.deleteFollow);

router.route("/followers/:id").get(followController.getAllFollowers);

router.route("/following/:id").get(followController.getAllFollowing);
