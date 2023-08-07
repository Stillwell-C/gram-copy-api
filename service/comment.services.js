const Comment = require("../models/Comment");

const findCommentById = async (id) => {
  return Comment.findById(id).lean().populate("author", "_id username").exec();
};

const findPostComments = async (page, limit, postId) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const commentsSkip = (pageInt - 1) * limitInt;

    return Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .limit(limitInt)
      .skip(commentsSkip)
      .lean()
      .populate("author", "_id username")
      .exec();
  } else {
    return Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .lean()
      .populate("author", "_id username")
      .exec();
  }
};

const createNewComment = async (author, parentPostId, commentBody) => {
  return Comment.create({
    author,
    parentPostId,
    commentBody,
  });
};

const findAndDeleteComment = async (id) => {
  return Comment.findByIdAndDelete(id).exec();
};

const countComments = async (parentPostId) => {
  return Comment.countDocuments({ parentPostId });
};

module.exports = {
  findCommentById,
  findPostComments,
  createNewComment,
  findAndDeleteComment,
  countComments,
};
