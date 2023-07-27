const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

router
  .route("/")
  .post(commentsController.createComment)
  .delete(commentsController.deleteComment);

router.route("/:id").get(commentsController.getComment);

router.route("/post/:id").get(commentsController.getPostComments);

module.exports = router;
