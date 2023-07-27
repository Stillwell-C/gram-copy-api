const {
  findAllSavedUsers,
  findUsersSavedPosts,
  findPostSave,
  createNewPostSave,
  findAndDeletePostSave,
} = require("../service/postSave.service");

const getAllSavedUsers = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const followers = await findAllSavedUsers(id, true, page, limit);

  if (!followers) {
    return res.status(400).json({ message: "No saved users found" });
  }

  return res.json(followers);
};

const getUsersSavedPosts = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const savedPosts = await findUsersSavedPosts(id, true, page, limit);

  if (!savedPosts) {
    return res.status(400).json({ message: "No saved posts found" });
  }

  return res.json(savedPosts);
};

const createPostSave = async (req, res) => {
  const { userID, parentPostID } = req.body;

  if (!userID || !parentPostID) {
    return res
      .status(400)
      .json({ message: "Must include a user ID and a post ID" });
  }

  const saveCheck = await findPostSave(userID, parentPostID);

  if (saveCheck) {
    return res.status(400).json({ message: "Already saved this post" });
  }

  const postSave = await createNewPostSave(userID, parentPostID);

  if (!postSave) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }

  return res.status(201).json({ message: "Saved post" });
};

const deletePostSave = async (req, res) => {
  const { userID, parentPostID } = req.body;

  if (!userID || !parentPostID) {
    return res
      .status(400)
      .json({ message: "Must include a user ID and a post ID" });
  }

  const postSave = await findPostSave(userID, parentPostID);

  if (postSave) {
    return res.status(400).json({ message: "Already saved this post" });
  }

  const deletedPostSave = await findAndDeletePostSave(postSave._id);

  if (!deletedPostSave) {
    return res
      .status(400)
      .json({ message: "Could not unsave post. Please try again." });
  }

  return res.json({ message: "Unsaved post" });
};

module.exports = {
  getAllSavedUsers,
  getUsersSavedPosts,
  createPostSave,
  deletePostSave,
};
