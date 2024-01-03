const Post = require("../models/Post");
const { deleteImageFromCloudinary } = require("./cloudinary.services");
const { checkValidObjectID } = require("./mongoose.services");

const findPost = async (query) => {
  return Post.findOne(query)
    .lean()
    .populate("user", "_id username userImgKey")
    .exec();
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
      .populate("user", "_id username userImgKey")
      .exec();
  } else {
    return Post.find(query)
      .sort("-createdAt")
      .lean()
      .select("-likedUsers")
      .populate("user", "_id username userImgKey")
      .exec();
  }
};

const findTaggedPosts = async (userID, page, limit) => {
  const idCheck = checkValidObjectID(userID);
  if (!idCheck) return;

  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 12;

    const postSkip = (pageInt - 1) * limitInt;

    return Post.find({ taggedUsers: userID })
      .sort("-createdAt")
      .limit(limitInt)
      .skip(postSkip)
      .lean()
      .select("-likedUsers")
      .populate("user", "_id username userImgKey")
      .exec();
  } else {
    return Post.find({ taggedUsers: userID })
      .sort("-createdAt")
      .lean()
      .select("-likedUsers")
      .populate("user", "_id username userImgKey")
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
  const idCheck = checkValidObjectID(postId);
  if (!idCheck) return;

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

const findAndAddTaggedUser = async (postID, userID) => {
  return Post.findOneAndUpdate(
    { _id: postID },
    { $push: { taggedUsers: userID } },
    { timestamps: false },
    { new: true }
  );
};

const findAndRemoveTaggedUser = async (postID, userID) => {
  return Post.findOneAndUpdate(
    { _id: postID },
    { $pull: { taggedUsers: userID } },
    { timestamps: false },
    { new: true }
  );
};

const findAndDeletePost = async (postId) => {
  const idCheck = checkValidObjectID(postId);
  if (!idCheck) return;

  return Post.findByIdAndDelete(postId).exec();
};

const countPosts = async (queryArr) => {
  if (queryArr?.length) {
    return Post.countDocuments({ user: { $in: queryArr } });
  } else {
    return Post.countDocuments();
  }
};

const countUserPosts = async (userID) => {
  return Post.countDocuments({ user: userID });
};

const countTaggedPosts = async (userID) => {
  return Post.countDocuments({ taggedUsers: userID });
};

const findAndDeleteAllUserPosts = async (userID) => {
  const posts = await Post.find({ user: userID });

  for (const post of posts) {
    const post = await findAndDeletePost(post._id);
    deleteImageFromCloudinary(post.imgKey);
  }
};

const findSearchedPosts = async (searchParam, searchQuery, page, limit) => {
  const pageInt = parseInt(page) || 1;
  const limitInt = parseInt(limit) || 10;

  const postsSkip = (pageInt - 1) * limitInt;

  return Post.find({
    [searchParam]: { $regex: searchQuery, $options: "i" },
  })
    .sort("-createdAt")
    .limit(limitInt)
    .skip(postsSkip)
    .lean()
    .select("-likedUsers")
    .populate("user", "_id username userImgKey")
    .exec();
};

const countSearchedPosts = async (searchParam, searchQuery) => {
  return Post.countDocuments({
    [searchParam]: { $regex: searchQuery, $options: "i" },
  });
};

const confirmPostAuthor = async (postID, userID) => {
  const post = await Post.findById(postID).lean().select("user");
  return post?.user?.toString() === userID;
};

const serializePosts = (posts) => {
  //Remove userID as it is part of key
  const parsedPosts = posts.map((post) => {
    return {
      _id: post._id,
      altText: post.altText,
      caption: post.caption,
      imgKey: post.imgKey,
      likes: post.likes,
      comments: post.comments,
      location: post.location,
      taggedUsers: post.taggedUsers,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        userImgKey: post.user.userImgKey,
        username: post.user.username,
      },
    };
  });

  return JSON.stringify(parsedPosts);
};

const deserializePosts = (userID, posts) => {
  const parsedPosts = JSON.parse(posts);

  const deserializedPosts = parsedPosts.map((post) => {
    return {
      ...post,
      user: {
        ...post.user,
        _id: userID,
      },
    };
  });

  return deserializedPosts;
};

module.exports = {
  findPost,
  findMultiplePosts,
  findTaggedPosts,
  createPost,
  findAndUpdatePost,
  findAndAddTaggedUser,
  findAndRemoveTaggedUser,
  findAndDeletePost,
  countPosts,
  countUserPosts,
  countTaggedPosts,
  findAndDeleteAllUserPosts,
  findSearchedPosts,
  countSearchedPosts,
  confirmPostAuthor,
  serializePosts,
  deserializePosts,
};
