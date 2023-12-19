const express = require("express");
const router = express.Router();
const postSaveController = require("../controllers/postSaveController");
const verifyJWT = require("../middleware/verifyJWT");
const selectiveJWTVerification = require("../middleware/selectiveJWTVerification");

router.route("/user/").get(verifyJWT, postSaveController.getUsersSavedPosts);

router
  .route("/:id/")
  .get(selectiveJWTVerification, postSaveController.getAllSavedUsers)
  .post(verifyJWT, postSaveController.createPostSave)
  .delete(verifyJWT, postSaveController.deletePostSave);

router.route("/post/:id").get(verifyJWT, postSaveController.getSavedPost);

module.exports = router;
