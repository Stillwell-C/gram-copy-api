const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUserInfo)
  .delete(usersController.deleteUser);

router.route("/:id").get(usersController.getUser);

router.route("/search/:searchQuery").get(usersController.searchUsers);

router.route("/userArr/:userArr").get(usersController.getUsersFromArr);

router
  .route("/availability/username/:username")
  .get(usersController.usernameAvailability);
router
  .route("/availability/email/:email")
  .get(usersController.emailAvailability);

module.exports = router;
