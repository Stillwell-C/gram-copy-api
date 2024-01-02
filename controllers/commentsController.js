const Comment = require("../models/Comment");
const {
  findCommentById,
  createNewComment,
  findAndDeleteComment,
  findPostComments,
  countComments,
} = require("../service/comment.services");
const { createNotification } = require("../service/notification.services");
const { findAndUpdatePost } = require("../service/post.services");

const getComment = async (req, res) => {
  const id = req?.params?.id;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const comment = await findCommentById(id);

  if (!comment) {
    return res.status(400).json({ message: "Comment not found" });
  }
  res.json(comment);
};

const getPostComments = async (req, res) => {
  const postId = req?.params?.id;

  if (!postId) {
    return res.status(400).json({ message: "User ID required" });
  }

  const { page, limit } = req.query;

  const comments = await findPostComments(page, limit, postId);

  const totalComments = await Comment.countDocuments({
    parentPostId: postId,
  });

  if (!comments?.length)
    return res.status(400).json({ message: "No comments found" });

  if (page && limit) {
    const totalPages = Math.ceil(totalComments / limit);
    return res.json({ comments, totalComments, limit, page, totalPages });
  }

  res.json({ comments, totalComments });
};

const createComment = async (req, res) => {
  const { parentPostId, commentBody } = req.body;
  const author = req?.reqID;

  if (!author || !parentPostId || !commentBody) {
    return res.status(400).json({ message: "All parameters required" });
  }

  const createdComment = await createNewComment(
    author,
    parentPostId,
    commentBody
  );

  if (!createdComment) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }

  const updatePost = await findAndUpdatePost(
    parentPostId,
    { $inc: { comments: 1 } },
    false
  );

  if (!updatePost) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "Post comment count not updated" });
  }

  await createNotification({
    notifiedUser: updatePost.user,
    notifyingUser: author,
    notificationType: "COMMENT",
    post: parentPostId,
  });

  res
    .status(200)
    .json({ message: `New comment created: ${createdComment._id}` });
};

const deleteComment = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const deletedComment = await findAndDeleteComment(id);

  if (!deletedComment) {
    return res.status(400).json({ message: "Comment not found" });
  }

  const updatePost = await findAndUpdatePost(
    parentPostId,
    { $inc: { comments: -1 } },
    false
  );

  if (!updatePost) {
    //Maybe this should be logged in some way
    return res.status(400).json({ message: "Post comment count not updated" });
  }

  res.json({ message: `Deleted comment ${deletedComment._id}` });
};

const getPostCommentsCount = async (req, res) => {
  const { id } = req.params;

  const commentCount = await countComments(id);

  if (commentCount !== 0 && !commentCount) {
    return res.status(400).json({ message: "No comments found" });
  }

  return res.json({ comments: commentCount });
};

module.exports = {
  getComment,
  getPostComments,
  createComment,
  deleteComment,
  getPostCommentsCount,
};
