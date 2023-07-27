const express = require("express");
const router = express.Router();
const postSaveController = require("../controllers/postSaveController");

router
  .route("/:id/")
  .get(postSaveController.getAllSavedUsers)
  .post(postSaveController.createPostSave)
  .delete(postSaveController.deletePostSave);

router.route("/user/:id/").get(postSaveController.getUsersSavedPosts);

module.exports = router;
