const express = require("express");
const router = express.Router();
const postLikeController = require("../controllers/postLikeController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/:id/")
  .get(postLikeController.getAllLikedUsers)
  .post(verifyJWT, postLikeController.createPostLike)
  .delete(verifyJWT, postLikeController.deletePostLike);

router
  .route("/user/:id/")
  .get(verifyJWT, postLikeController.getUsersLikedPosts);

module.exports = router;
