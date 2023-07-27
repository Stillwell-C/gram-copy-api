const express = require("express");
const router = express.Router();
const postLikeController = require("../controllers/postLikeController");

router
  .route("/post/:id/")
  .get(postLikeController.getAllLikedUsers)
  .post(postLikeController.createPostLike)
  .delete(postLikeController.deletePostLike);

router.route("/user/:id/").get(postLikeController.getUsersLikedPosts);

module.exports = router;
