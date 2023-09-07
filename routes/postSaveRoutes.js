const express = require("express");
const router = express.Router();
const postSaveController = require("../controllers/postSaveController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/:id/")
  .get(postSaveController.getAllSavedUsers)
  .post(verifyJWT, postSaveController.createPostSave)
  .delete(verifyJWT, postSaveController.deletePostSave);

router.route("/user/").get(verifyJWT, postSaveController.getUsersSavedPosts);

module.exports = router;
