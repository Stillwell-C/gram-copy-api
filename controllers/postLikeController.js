const { findAndUpdatePost } = require("../service/post.services");
const {
  findAllLikedUsers,
  findUsersLikedPosts,
  findPostLike,
  createNewPostLike,
  findAndDeletePostLike,
} = require("../service/postLike.service");

const getAllLikedUsers = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const followers = await findAllLikedUsers(id, true, page, limit);

  if (!followers) {
    return res.status(400).json({ message: "No likes found" });
  }

  return res.json(followers);
};

const getUsersLikedPosts = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const likedPosts = await findUsersLikedPosts(id, true, page, limit);

  if (!likedPosts) {
    return res.status(400).json({ message: "No likes found" });
  }

  return res.json(likedPosts);
};

const createPostLike = async (req, res) => {
  const { userID, parentPostID } = req.body;

  if (!userID || !parentPostID) {
    return res
      .status(400)
      .json({ message: "Must include a user ID and a post ID" });
  }

  const likeCheck = await findPostLike(userID, parentPostID);

  if (likeCheck) {
    return res.status(400).json({ message: "Already liked this post" });
  }

  const postLike = await createNewPostLike(userID, parentPostID);
  const updatePost = await findAndUpdatePost(
    parentPostID,
    { $inc: { likes: 1 } },
    false
  );

  if (!postLike) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }
  if (!updatePost) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "Post like count not updated" });
  }

  return res.status(201).json({ message: "Liked post" });
};

const deletePostLike = async (req, res) => {
  const { userID, parentPostID } = req.body;

  if (!userID || !parentPostID) {
    return res
      .status(400)
      .json({ message: "Must include a user ID and a post ID" });
  }

  const postLike = await findPostLike(userID, parentPostID);

  if (postLike) {
    return res.status(400).json({ message: "Already liked this post" });
  }

  const deletedPostLike = await findAndDeletePostLike(postLike._id);
  const updatePost = await findAndUpdatePost(
    parentPostID,
    { $inc: { likes: -1 } },
    false
  );

  if (!deletedPostLike) {
    return res
      .status(400)
      .json({ message: "Could not unlike post. Please try again." });
  }
  if (!updatePost) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "Post like count not updated" });
  }

  return res.json({ message: "Unliked post" });
};

module.exports = {
  getAllLikedUsers,
  getUsersLikedPosts,
  createPostLike,
  deletePostLike,
};
