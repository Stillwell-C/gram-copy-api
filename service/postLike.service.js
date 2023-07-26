const PostLike = require("../models/PostLike");

const findPostLike = async (user, parentPostId) => {
  return PostLike.findOne({ user, parentPostId }).exec();
};

const findAllLikedUsers = async (postID, populate = false, page, limit) => {
  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostLike.find({ parentPostId: postID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("user", "_id username")
        .select("-parentPostId")
        .lean();
    }

    return PostLike.find({ parentPostId: postID })
      .sort("createdAt")
      .populate("user", "_id username")
      .select("-parentPostId")
      .lean();
  } else {
    return PostLike.find({ parentPostId: postID })
      .sort("createdAt")
      .select("-parentPostId")
      .lean();
  }
};

const findUsersLikedPosts = async (userID, populate = false, page, limit) => {
  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostLike.find({ user: userID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("parentPostId", "_id")
        .select("-user")
        .lean();
    }

    return PostLike.find({ user: userID })
      .sort("createdAt")
      .populate("parentPostId", "_id")
      .select("-user")
      .lean();
  } else {
    return PostLike.find({ user: userID })
      .sort("createdAt")
      .select("-user")
      .lean();
  }
};

const createNewPostLike = async (user, parentPostId) => {
  return PostLike.create({ user, parentPostId }).exec();
};

const findAndDeletePostLike = async (id) => {
  return PostLike.findByIdAndDelete(id);
};

module.exports = {
  findPostLike,
  findAllLikedUsers,
  findUsersLikedPosts,
  createNewPostLike,
  findAndDeletePostLike,
};
