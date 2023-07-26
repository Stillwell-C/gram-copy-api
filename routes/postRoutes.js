const express = require("express");
const router = express.Router();
const postController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");

router
  .route("/")
  .get(postController.getMultiplePosts)
  .post(postController.createNewPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

router.route("/:id").get(postController.getPost);

router.route("/:id/comments").get(commentsController.getPostComments);
