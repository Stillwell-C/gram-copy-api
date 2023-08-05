const express = require("express");
const router = express.Router();
const postController = require("../controllers/postsController");

router
  .route("/")
  .get(postController.getMultiplePosts)
  .post(postController.createNewPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

router.route("/:id").get(postController.getPost);

router.route("/tagged/:userID").get(postController.getTaggedPosts);

module.exports = router;
