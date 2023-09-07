const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .post(verifyJWT, commentsController.createComment)
  .delete(verifyJWT, commentsController.deleteComment);

router.route("/:id").get(commentsController.getComment);

router.route("/post/:id").get(commentsController.getPostComments);

module.exports = router;
