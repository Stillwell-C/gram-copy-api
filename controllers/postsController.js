const Post = require("../models/Post");
const { generateExpectedSignature } = require("../service/cloudinary.services");
const {
  findPost,
  countPosts,
  findMultiplePosts,
  createPost,
  findAndUpdatePost,
  findAndDeletePost,
} = require("../service/post.services");
const { findUserById, findAndUpdateUser } = require("../service/user.services");

const getPost = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Post ID required" });
  }
  const post = await findPost({ _id: req.params.id });

  if (!post) {
    return res.status(400).json({ message: "Post not found" });
  }

  return res.json(post);
};

const getMultiplePosts = async (req, res) => {
  const { page, limit, userID, feedID } = req.query;

  let queryArr = [];
  if (feedID) {
    //Some logic to make Arr of followers
  } else if (userID) {
    queryArr = [userID];
  }

  const posts = await findMultiplePosts(page, limit, queryArr);

  const totalPosts = await countPosts(queryArr);

  if (!posts?.length)
    return res.status(400).json({ message: "No posts found" });

  res.json({ posts, totalPosts });
};

const createNewPost = async (req, res) => {
  const { user, altText, caption, imgData, location } = req.body;

  console.log(req.body);

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

  if (!user) {
    return res
      .status(401)
      .json({ message: "Please sign in before submitting post." });
  }

  const userCheck = await findUserById(user);

  if (!userCheck) {
    return res.status(400).json({
      message: "Invalid user. Please sign in before submitting post.",
    });
  }

  const newPost = {
    user,
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
    user,
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
  const { id, altText, caption, location, likeChange } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID parameter required" });
  }

  if (!altText && !caption && !location && !likeChange) {
    return res.status(400).json({
      message:
        "Update requires change to alt text, caption, location, likes parameters",
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
  //The following will not update the timestamp
  if (likeChange) {
    if (likeChange > 0) {
      updatePost = await findAndUpdatePost(id, { $inc: { likes: 1 } }, false);
    } else {
      updatePost = await findAndUpdatePost(id, { $inc: { likes: -1 } }, false);
    }
  }

  if (!updatedPost) {
    return res.status(400).json({ message: "Post not found" });
  }

  res.json({ message: `Updated post: ${updatedPost._id}` });
};

const deletePost = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  const deletedPost = await findAndDeletePost(id);

  if (!deletedPost) {
    return res.status(400).json({ message: "Post not found" });
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

  res.json({ message: `Deleted post ${deletedPost._id}` });
};

module.exports = {
  getPost,
  getMultiplePosts,
  createNewPost,
  updatePost,
  deletePost,
};
