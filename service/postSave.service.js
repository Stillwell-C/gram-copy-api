const PostSave = require("../models/PostSave");

const findPostSave = async (user, parentPostId) => {
  return PostSave.findOne({ user, parentPostId }).exec();
};

const findAllSavedUsers = async (postID, populate = false, page, limit) => {
  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostSave.find({ parentPostId: postID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("user", "_id username")
        .select("-parentPostId")
        .lean();
    }

    return PostSave.find({ parentPostId: postID })
      .sort("createdAt")
      .populate("user", "_id username")
      .select("-parentPostId")
      .lean();
  } else {
    return PostSave.find({ parentPostId: postID })
      .sort("createdAt")
      .select("-parentPostId")
      .lean();
  }
};

const findUsersSavedPosts = async (userID, populate = false, page, limit) => {
  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostSave.find({ user: userID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("parentPostId", "_id")
        .select("-user")
        .lean();
    }

    return PostSave.find({ user: userID })
      .sort("createdAt")
      .populate("parentPostId", "_id")
      .select("-user")
      .lean();
  } else {
    return PostSave.find({ user: userID })
      .sort("createdAt")
      .select("-user")
      .lean();
  }
};

const createNewPostSave = async (user, parentPostId) => {
  return PostSave.create({ user, parentPostId }).exec();
};

const findAndDeletePostSave = async (id) => {
  return PostSave.findByIdAndDelete(id);
};

module.exports = {
  findPostSave,
  findAllSavedUsers,
  findUsersSavedPosts,
  createNewPostSave,
  findAndDeletePostSave,
};
