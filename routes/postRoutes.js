const express = require("express");
const router = express.Router();
const postController = require("../controllers/postsController");
const selectiveJWTVerification = require("../middleware/selectiveJWTVerification");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(selectiveJWTVerification, postController.getMultiplePosts)
  .post(postController.createNewPost)
  .patch(verifyJWT, postController.updatePost)
  .delete(verifyJWT, postController.deletePost);

router.route("/search").get(postController.searchPosts);

router.route("/tagged").patch(verifyJWT, postController.updateTaggedUsers);

router.route("/tagged/:userID").get(postController.getTaggedPosts);

router.route("/:id").get(postController.getPost);

module.exports = router;
