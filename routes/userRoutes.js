const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const postsSaveController = require("../controllers/postSaveController");
const postsLikeController = require("../controllers/postLikeController");

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUserInfo)
  .delete(usersController.deleteUser);

router.route("/:id").get(usersController.getUser);

router.route("/:id/save").get(postsSaveController.getUsersSavedPosts);

router.route("/:id/like").get(postsLikeController.getUsersLikedPosts);

module.exports = router;
