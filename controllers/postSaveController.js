const { findPostLike } = require("../service/postLike.service");
const {
  findAllSavedUsers,
  findUsersSavedPosts,
  findPostSave,
  createNewPostSave,
  findAndDeletePostSave,
  countUsersSavedPosts,
  countUsersWhoSavedPost,
} = require("../service/postSave.service");

const getAllSavedUsers = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const savedUsers = await findAllSavedUsers(id, true, page, limit);

  if (!savedUsers) {
    return res.status(400).json({ message: "No saved users found" });
  }

  const totalSavedUsers = await countUsersWhoSavedPost(id);

  return res.json({ savedUsers, totalSavedUsers });
};

const getUsersSavedPosts = async (req, res) => {
  const id = req?.reqID;
  const { page, limit } = req?.query;

  const savedPosts = await findUsersSavedPosts(id, true, page, limit);

  if (!savedPosts) {
    return res.status(400).json({ message: "No saved posts found" });
  }

  const formattedSavedPosts = savedPosts.map((savedPost) => ({
    ...savedPost.post,
  }));

  for (const post of formattedSavedPosts) {
    const like = await findPostLike(id, post._id);

    post.isLiked = like;
    post.isSaved = true;
  }

  const totalSavedPosts = await countUsersSavedPosts(id);

  if (page && limit) {
    const totalPages = Math.ceil(totalSavedPosts / limit);
    return res.json({
      posts: formattedSavedPosts,
      totalPosts: totalSavedPosts,
      limit,
      totalPages,
    });
  }

  return res.json({ posts: formattedSavedPosts, totalPosts: totalSavedPosts });
};

const createPostSave = async (req, res) => {
  const userID = req?.reqID;
  const parentPostID = req.params?.id;

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
  const userID = req?.reqID;
  const parentPostID = req.params?.id;

  if (!userID || !parentPostID) {
    return res
      .status(400)
      .json({ message: "Must include a user ID and a post ID" });
  }

  const postSave = await findPostSave(userID, parentPostID);

  if (!postSave) {
    return res.status(400).json({ message: "You have not saved this post." });
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
