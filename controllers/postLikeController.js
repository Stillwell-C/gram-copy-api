const { createNotification } = require("../service/notification.services");
const { findAndUpdatePost } = require("../service/post.services");
const {
  findAllLikedUsers,
  findUsersLikedPosts,
  findPostLike,
  createNewPostLike,
  findAndDeletePostLike,
  countPostLikes,
} = require("../service/postLike.service");

const getLikedPost = async (req, res) => {
  const { id } = req.params;
  const reqID = req.reqID;

  const like = await findPostLike(reqID, id);
  const isLiked = like ? true : false;

  return res.json({ isLiked });
};

const getAllLikedUsers = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const followers = await findAllLikedUsers(id, true, page, limit);

  if (!followers) {
    return res.status(400).json({ message: "No likes found" });
  }
  //max num

  return res.json(followers);
};

const getUsersLikedPosts = async (req, res) => {
  const id = req?.reqID;
  const { page, limit } = req?.query;

  const likedPosts = await findUsersLikedPosts(id, true, page, limit);

  if (!likedPosts) {
    return res.status(400).json({ message: "No likes found" });
  }
  //max num

  return res.json(likedPosts);
};

const createPostLike = async (req, res) => {
  const userID = req?.reqID;
  const parentPostID = req.params?.id;

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

  if (!postLike) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }

  const updatePost = await findAndUpdatePost(
    parentPostID,
    { $inc: { likes: 1 } },
    false
  );

  if (!updatePost) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "Post like count not updated" });
  }

  await createNotification({
    notifiedUser: updatePost.user,
    notifyingUser: userID,
    notificationType: "POSTLIKE",
    post: parentPostID,
  });

  return res.status(201).json({ message: "Liked post" });
};

const deletePostLike = async (req, res) => {
  const userID = req?.reqID;
  const parentPostID = req.params?.id;

  if (!userID || !parentPostID) {
    return res
      .status(400)
      .json({ message: "Must include a user ID and a post ID" });
  }

  const postLike = await findPostLike(userID, parentPostID);

  if (!postLike) {
    return res.status(400).json({ message: "You have not liked this post" });
  }

  const deletedPostLike = await findAndDeletePostLike(postLike._id);

  if (!deletedPostLike) {
    return res
      .status(400)
      .json({ message: "Could not unlike post. Please try again." });
  }

  const updatePost = await findAndUpdatePost(
    parentPostID,
    { $inc: { likes: -1 } },
    false
  );

  if (!updatePost) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "Post like count not updated" });
  }

  return res.json({ message: "Unliked post" });
};

const getPostLikeCount = async (req, res) => {
  const { id } = req.params;

  const likeCount = await countPostLikes(id);

  if (likeCount !== 0 && !likeCount) {
    return res.status(400).json({ message: "No likes found" });
  }

  return res.json({ likes: likeCount });
};

module.exports = {
  getLikedPost,
  getAllLikedUsers,
  getUsersLikedPosts,
  createPostLike,
  deletePostLike,
  getPostLikeCount,
};
