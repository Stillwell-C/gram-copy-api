const express = require("express");
const router = express.Router();
const postController = require("../controllers/postsController");
const selectiveJWTVerification = require("../middleware/selectiveJWTVerification");

router
  .route("/")
  .get(selectiveJWTVerification, postController.getMultiplePosts)
  .post(postController.createNewPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

router.route("/:id").get(postController.getPost);

router.route("/tagged").patch(postController.updateTaggedUsers);

router.route("/tagged/:userID").get(postController.getTaggedPosts);

module.exports = router;
