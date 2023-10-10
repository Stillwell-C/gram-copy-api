const {
  generateExpectedSignature,
  deleteImageFromCloudinary,
} = require("../service/cloudinary.services");
const { findFollow, findAllFollowing } = require("../service/follow.services");
const { checkValidObjectID } = require("../service/mongoose.services");
const {
  findPost,
  countPosts,
  findMultiplePosts,
  createPost,
  findAndUpdatePost,
  findAndDeletePost,
  countTaggedPosts,
  findTaggedPosts,
  findAndAddTaggedUser,
  findAndRemoveTaggedUser,
  countSearchedPosts,
  findSearchedPosts,
} = require("../service/post.services");
const { findPostLike } = require("../service/postLike.service");
const { findPostSave } = require("../service/postSave.service");
const { findUserById, findAndUpdateUser } = require("../service/user.services");

const getPost = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  const reqID = req.reqID;

  const validID = checkValidObjectID(req.params.id);

  if (!validID) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  const post = await findPost({ _id: req.params.id });

  if (!post) {
    return res.status(400).json({ message: "Post not found" });
  }

  post.isFollow = false;

  if (reqID) {
    const like = await findPostLike(reqID, post._id);
    const save = await findPostSave(reqID, post._id);

    post.isLiked = like ? true : false;
    post.isSaved = save ? true : false;

    if (post.user._id !== reqID) {
      const follow = await findFollow(post.user._id, reqID);
      if (follow) post.isFollow = true;
    }
  }

  return res.json(post);
};

const getMultiplePosts = async (req, res) => {
  const { page, limit, userID, followingFeed } = req.query;
  const reqID = req.reqID;

  let queryArr = [];
  if (followingFeed === "true") {
    const following = await findAllFollowing(reqID);

    if (!following || !following?.length) {
      return res.status(400).json({
        message: "User has no feed because not following other users",
      });
    }

    for (const followedUser of following) {
      queryArr.push(followedUser.followed._id);
    }
  } else if (userID?.length) {
    const idCheck = checkValidObjectID(userID);
    if (!idCheck) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    queryArr.push(userID);
  }

  const posts = await findMultiplePosts(page, limit, queryArr);

  const totalPosts = await countPosts(queryArr);

  if (!posts?.length)
    return res.status(400).json({ message: "No posts found" });

  //This works but has slowed down process. May be unavoidable
  if (reqID) {
    for (const post of posts) {
      const like = await findPostLike(reqID, post._id);
      const save = await findPostSave(reqID, post._id);
      let follow = false;
      if (post.user._id !== reqID)
        follow = await findFollow(post.user._id, reqID);

      post.isLiked = like ? true : false;
      post.isSaved = save ? true : false;
      post.isFollow = follow ? true : false;
    }
  } else {
    for (const post of posts) {
      post.isLiked = false;
      post.isSaved = false;
      post.isFollow = false;
    }
  }

  if (page && limit) {
    const totalPages = Math.ceil(totalPosts / limit);
    return res.json({ posts, totalPosts, limit, page, totalPages });
  }

  res.json({ posts, totalPosts });
};

const getTaggedPosts = async (req, res) => {
  const { page, limit } = req.query;
  const { userID } = req.params;
  const reqID = req.reqID;
  console.log(reqID);

  if (!userID) {
    return res.status(400).json({ message: "Must include userID" });
  }

  const posts = await findTaggedPosts(userID, page, limit);

  const totalPosts = await countTaggedPosts(userID);

  if (!posts?.length)
    return res.status(400).json({ message: "No posts found" });

  if (reqID) {
    for (const post of posts) {
      const like = await findPostLike(reqID, post._id);
      const save = await findPostSave(reqID, post._id);
      let follow = false;
      if (post.user._id !== reqID)
        follow = await findFollow(post.user._id, reqID);

      post.isLiked = like ? true : false;
      post.isSaved = save ? true : false;
      post.isFollow = follow ? true : false;
    }
  } else {
    for (const post of posts) {
      post.isLiked = false;
      post.isSaved = false;
      post.isFollow = false;
    }
  }

  if (page && limit) {
    const totalPages = Math.ceil(totalPosts / limit);
    return res.json({ posts, totalPosts, limit, page, totalPages });
  }

  res.json({ posts, totalPosts });
};

const searchPosts = async (req, res) => {
  const { page, limit, param, query } = req.query;
  const reqID = req.reqID;

  const posts = await findSearchedPosts(param, query, page, limit);

  const totalPosts = await countSearchedPosts(param, query);

  if (!posts?.length)
    return res.status(400).json({ message: "No posts found" });

  //This works but has slowed down process. May be unavoidable
  if (reqID) {
    for (const post of posts) {
      const like = await findPostLike(reqID, post._id);
      const save = await findPostSave(reqID, post._id);
      let follow = false;
      if (post.user._id !== reqID)
        follow = await findFollow(post.user._id, reqID);

      post.isLiked = like ? true : false;
      post.isSaved = save ? true : false;
      post.isFollow = follow ? true : false;
    }
  } else {
    for (const post of posts) {
      post.isLiked = false;
      post.isSaved = false;
      post.isFollow = false;
    }
  }

  if (page && limit) {
    const totalPages = Math.ceil(totalPosts / limit);
    return res.json({ posts, totalPosts, limit, page, totalPages });
  }

  res.json({ posts, totalPosts });
};

const createNewPost = async (req, res) => {
  const { altText, caption, imgData, location } = req.body;
  const reqID = req.reqID;

  if (
    !imgData?.public_id ||
    !imgData?.version ||
    !imgData?.signature ||
    !imgData?.format
  ) {
    return res
      .status(400)
      .json({ message: "Post must include all necessary image data." });
  }

  const expectedCloudinarySignature = generateExpectedSignature(
    imgData.public_id,
    imgData.version
  );

  if (expectedCloudinarySignature !== imgData.signature) {
    return res
      .status(401)
      .json({ message: "Invalid image signature provided." });
  }

  if (!reqID) {
    return res
      .status(401)
      .json({ message: "Please sign in before submitting post." });
  }

  const userCheck = await findUserById(reqID);

  if (!userCheck) {
    return res.status(400).json({
      message: "Invalid user. Please sign in before submitting post.",
    });
  }

  const newPost = {
    user: reqID,
    altText,
    caption,
    location,
    imgKey: `${imgData.public_id}.${imgData.format}`,
  };

  const createdPost = await createPost(newPost);

  if (!createdPost) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }

  const updatedUser = await findAndUpdateUser(
    reqID,
    { $inc: { postNo: 1 } },
    false
  );

  if (!updatedUser) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "User post count not updated" });
  }

  res.status(201).json({ message: "New post created" });
};

const updatePost = async (req, res) => {
  const { id, altText, caption, location } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID parameter required" });
  }

  if (!altText && !caption && !location) {
    return res.status(400).json({
      message:
        "Update requires change to alt text, caption, location, or likes parameters",
    });
  }

  let updatedPost;
  //The following will update the timestamp
  if (altText || caption || location) {
    let updateObj;
    if (altText?.length) updateObj.altText = altText;
    if (caption?.length) updateObj.caption = caption;
    if (location?.length) updateObj.location = location;

    updatePost = await findAndUpdatePost(id, { ...updateObj });
  }

  if (!updatedPost) {
    return res.status(400).json({ message: "Post not found" });
  }

  res.json({ message: `Updated post: ${updatedPost._id}` });
};

const updateTaggedUsers = async (req, res) => {
  const { postID, userID, updateAction } = req?.body;

  if (!postID || !userID || !updateAction) {
    return res.status(400).json({
      message: "Must include post ID, user ID, and update action",
    });
  }

  const userIdParse = checkValidObjectID(userID);
  const postIdParse = checkValidObjectID(postID);

  if (!userIdParse || !postIdParse) {
    return res.status(400).json({
      message: "Must include valid user ID and post ID",
    });
  }

  const post = await findPost({ _id: postID });

  if (!post) {
    return res.status(400).json({
      message: "Post not found",
    });
  }
  if (post.taggedUsers.length >= 20) {
    return res.status(400).json({
      message: "Cannot tag more than 20 users",
    });
  }

  let updatedUser;
  if (updateAction === "add" || updateAction === "ADD") {
    const userCheck = post.taggedUsers.every(
      (taggedUser) => taggedUser.toString() !== userID
    );
    if (!userCheck) {
      return res.status(400).json({
        message: "Cannot tag the same user twice",
      });
    }

    updatedUser = await findAndAddTaggedUser(postID, userID);
  } else if (updateAction === "remove" || updateAction === "REMOVE") {
    const userCheck = post.taggedUsers.some(
      (taggedUser) => taggedUser.toString() === userID
    );
    if (!userCheck) {
      return res.status(400).json({
        message: "User is not tagged in this image",
      });
    }

    updatedUser = await findAndRemoveTaggedUser(postID, userID);
  }

  if (!updatedUser) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }

  res.json(updatedUser);
};

const deletePost = async (req, res) => {
  const { id, imgKey } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  if (!imgKey) {
    return res.status(400).json({ message: "Img Key required" });
  }

  const postCheck = await findPost({ _id: id });

  if (!postCheck) {
    return res.status(400).json({ message: "Post not found" });
  }

  if (postCheck.user._id.toString() !== req.reqID) {
    return res
      .status(401)
      .json({ message: "You are not authorized to delete this post" });
  }

  const deletedPost = await findAndDeletePost(id);

  if (!deletedPost) {
    return res.status(400).json({ message: "An error occurred." });
  }

  const updatedUser = await findAndUpdateUser(
    deletedPost.user,
    { $inc: { postNo: -1 } },
    false
  );

  if (!updatedUser) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "User post count not updated" });
  }

  deleteImageFromCloudinary(imgKey);

  res.json({ message: `Deleted post ${deletedPost._id}` });
};

module.exports = {
  getPost,
  getMultiplePosts,
  searchPosts,
  getTaggedPosts,
  createNewPost,
  updatePost,
  updateTaggedUsers,
  deletePost,
};
