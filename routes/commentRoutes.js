const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

router
  .route("/")
  .post(commentsController.createComment)
  .delete(commentsController.deleteComment);

router.route("/:id").get(commentsController.getComment);

module.exports = router;
