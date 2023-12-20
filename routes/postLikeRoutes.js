const express = require("express");
const router = express.Router();
const postLikeController = require("../controllers/postLikeController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/:id/")
  .get(postLikeController.getAllLikedUsers)
  .post(verifyJWT, postLikeController.createPostLike)
  .delete(verifyJWT, postLikeController.deletePostLike);

router.route("/user/").get(verifyJWT, postLikeController.getUsersLikedPosts);

router.route("/post/:id").get(verifyJWT, postLikeController.getLikedPost);

router.route("/count/post/:id").get(postLikeController.getPostLikeCount);

module.exports = router;
