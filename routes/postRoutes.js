const express = require("express");
const router = express.Router();
const postController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const postSaveController = require("../controllers/postSaveController");
const postLikeController = require("../controllers/postLikeController");

router
  .route("/")
  .get(postController.getMultiplePosts)
  .post(postController.createNewPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

router.route("/:id").get(postController.getPost);

router.route("/:id/comments").get(commentsController.getPostComments);

router
  .route("/:id/save")
  .get(postSaveController.getAllSavedUsers)
  .post(postSaveController.createPostSave)
  .delete(postSaveController.deletePostSave);

router
  .route("/:id/like")
  .get(postLikeController.getAllLikedUsers)
  .post(postLikeController.createPostLike)
  .delete(postLikeController.deletePostLike);
