const PostSave = require("../models/PostSave");

const findPostSave = async (user, post) => {
  return PostSave.findOne({ user, post }).exec();
};

const findAllSavedUsers = async (postID, populate = false, page, limit) => {
  const idCheck = checkValidObjectID(postID);
  if (!idCheck) return;

  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostSave.find({ post: postID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("user", "_id username")
        .select("-post")
        .lean();
    }

    return PostSave.find({ post: postID })
      .sort("createdAt")
      .populate("user", "_id username")
      .select("-post")
      .lean();
  } else {
    return PostSave.find({ post: postID })
      .sort("createdAt")
      .select("-post")
      .lean();
  }
};

const findUsersSavedPosts = async (userID, populate = false, page, limit) => {
  const idCheck = checkValidObjectID(userID);
  if (!idCheck) return;

  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return PostSave.find({ user: userID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("post")
        .populate({
          path: "post",
          populate: {
            path: "user",
            model: "User",
            select: "_id username userImgKey",
          },
        })
        .select("-user")
        .lean();
    }

    return PostSave.find({ user: userID })
      .sort("createdAt")
      .populate("post")
      .populate({
        path: "post",
        populate: {
          path: "user",
          model: "User",
          select: "_id username userImgKey",
        },
      })
      .select("-user")
      .lean();
  } else {
    return PostSave.find({ user: userID })
      .sort("createdAt")
      .select("-user")
      .lean();
  }
};

const createNewPostSave = async (user, post) => {
  const idCheck = checkValidObjectID(post);
  if (!idCheck) return;

  return PostSave.create({ user, post });
};

const findAndDeletePostSave = async (id) => {
  return PostSave.findByIdAndDelete(id);
};

const countUsersSavedPosts = async (userID) => {
  return PostSave.countDocuments({ user: userID });
};

const countUsersWhoSavedPost = async (postID) => {
  return PostSave.countDocuments({ post: postID });
};

module.exports = {
  findPostSave,
  findAllSavedUsers,
  findUsersSavedPosts,
  createNewPostSave,
  findAndDeletePostSave,
  countUsersSavedPosts,
  countUsersWhoSavedPost,
};
