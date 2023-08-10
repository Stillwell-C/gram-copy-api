const Comment = require("../models/Comment");
const {
  findCommentById,
  createNewComment,
  findAndDeleteComment,
  findPostComments,
} = require("../service/comment.services");

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

  if (!comments) return res.status(400).json({ message: "No comments found" });

  if (page && limit) {
    const totalPages = Math.ceil(totalComments / limit);
    return res.json({ comments, totalComments, limit, totalPages });
  }

  res.json({ comments, totalComments });
};

const createComment = async (req, res) => {
  const { author, parentPostId, commentBody } = req.body;

  if (!author || !parentPostId || !commentBody) {
    return res.status(400).json({ message: "All parameters required" });
  }

  const createdComment = await createNewComment(
    author,
    parentPostId,
    commentBody
  );

  if (createdComment) {
    res
      .status(200)
      .json({ message: `New comment created: ${createdComment._id}` });
  } else {
    res.status(400).json({ message: "Invalid data recieved" });
  }
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

  res.json({ message: `Deleted comment ${deletedComment._id}` });
};

module.exports = {
  getComment,
  getPostComments,
  createComment,
  deleteComment,
};
