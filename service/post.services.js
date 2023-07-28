const Post = require("../models/Post");

const findPost = async (query) => {
  return Post.findOne(query).lean().populate("user", "_id username").exec();
};

const findMultiplePosts = async (page, limit, queryArr) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 6;

    const postSkip = (pageInt - 1) * limitInt;

    //Allow to filter by friends or specific userIDs
    let query = {};
    if (queryArr?.length) {
      query = { user: { $in: queryArr } };
    }

    return Post.find(query)
      .sort("-createdAt")
      .limit(limitInt)
      .skip(postSkip)
      .lean()
      .select("-likedUsers")
      .populate("user", "_id username")
      .exec();
  } else {
    return Post.find(query)
      .sort("-createdAt")
      .lean()
      .select("-likedUsers")
      .populate("user", "_id username")
      .exec();
  }
};

const createPost = async (postData) => {
  return Post.create(postData);
};

const findAndUpdatePost = async (
  postId,
  updatedPostData,
  timestamps = true
) => {
  //Update timestamps when user updates post, but not in the case of likes, etc.
  if (timestamps) {
    return Post.findOneAndUpdate(
      { _id: postId },
      { ...updatedPostData },
      { new: true }
    ).exec();
  } else {
    return Post.findOneAndUpdate(
      { _id: postId },
      { ...updatedPostData },
      { timestamps: false },
      { new: true }
    ).exec();
  }
};

const findAndDeletePost = async (postId) => {
  return Post.findByIdAndDelete(postId).exec();
};

const countPosts = async (queryArr) => {
  if (queryArr?.length) {
    return Post.countDocuments({ user: { $in: queryArr } });
  } else {
    return Post.countDocuments();
  }
};

module.exports = {
  findPost,
  findMultiplePosts,
  createPost,
  findAndUpdatePost,
  findAndDeletePost,
  countPosts,
};
