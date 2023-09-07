const Comment = require("../models/Comment");
const { checkValidObjectID } = require("./mongoose.services");

const findCommentById = async (id) => {
  const idCheck = checkValidObjectID(id);
  if (!idCheck) return;
  return Comment.findById(id)
    .lean()
    .populate("author", "_id username userImgKey")
    .exec();
};

const findPostComments = async (page, limit, postId) => {
  const idCheck = checkValidObjectID(postId);
  if (!idCheck) return;

  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const commentsSkip = (pageInt - 1) * limitInt;

    return Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .limit(limitInt)
      .skip(commentsSkip)
      .lean()
      .populate("author", "_id username userImgKey")
      .exec();
  } else {
    return Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .lean()
      .populate("author", "_id username userImgKey")
      .exec();
  }
};

const createNewComment = async (author, parentPostId, commentBody) => {
  const postIdCheck = checkValidObjectID(parentPostId);
  const authorIdCheck = checkValidObjectID(author);
  if (!postIdCheck || !authorIdCheck) return;

  return Comment.create({
    author,
    parentPostId,
    commentBody,
  });
};

const findAndDeleteComment = async (id) => {
  const idCheck = checkValidObjectID(id);
  if (!idCheck) return;
  return Comment.findByIdAndDelete(id).exec();
};

const countComments = async (parentPostId) => {
  const idCheck = checkValidObjectID(parentPostId);
  if (!idCheck) return;
  return Comment.countDocuments({ parentPostId });
};

module.exports = {
  findCommentById,
  findPostComments,
  createNewComment,
  findAndDeleteComment,
  countComments,
};
