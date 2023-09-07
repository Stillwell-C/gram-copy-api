const express = require("express");
const router = express.Router();
const postSaveController = require("../controllers/postSaveController");
const verifyJWT = require("../middleware/verifyJWT");

router.route("/user/").get(verifyJWT, postSaveController.getUsersSavedPosts);

router
  .route("/:id/")
  .get(postSaveController.getAllSavedUsers)
  .post(verifyJWT, postSaveController.createPostSave)
  .delete(verifyJWT, postSaveController.deletePostSave);

module.exports = router;
