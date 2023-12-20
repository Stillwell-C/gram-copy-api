const PostLike = require("../models/PostLike");
const { checkValidObjectID } = require("./mongoose.services");

const findPostLike = async (user, post) => {
  return PostLike.findOne({ user, post }).exec();
};

const findAllLikedUsers = async (postID, populate = false, page, limit) => {
  const idCheck = checkValidObjectID(postID);
  if (!idCheck) return;

  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostLike.find({ post: postID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("user", "_id username")
        .select("-post")
        .lean();
    }

    return PostLike.find({ post: postID })
      .sort("createdAt")
      .populate("user", "_id username")
      .select("-post")
      .lean();
  } else {
    return PostLike.find({ post: postID })
      .sort("createdAt")
      .select("-post")
      .lean();
  }
};

const findUsersLikedPosts = async (userID, populate = false, page, limit) => {
  const idCheck = checkValidObjectID(userID);
  if (!idCheck) return;

  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostLike.find({ user: userID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("post", "_id")
        .select("-user")
        .lean();
    }

    return PostLike.find({ user: userID })
      .sort("createdAt")
      .populate("post", "_id")
      .select("-user")
      .lean();
  } else {
    return PostLike.find({ user: userID })
      .sort("createdAt")
      .select("-user")
      .lean();
  }
};

const createNewPostLike = async (user, post) => {
  const idCheck = checkValidObjectID(post);
  if (!idCheck) return;

  return PostLike.create({ user, post });
};

const findAndDeletePostLike = async (id) => {
  return PostLike.findByIdAndDelete(id);
};

const countPostLikes = async (postID) => {
  return PostLike.countDocuments({ post: postID });
};

module.exports = {
  findPostLike,
  findAllLikedUsers,
  findUsersLikedPosts,
  createNewPostLike,
  findAndDeletePostLike,
  countPostLikes,
};
