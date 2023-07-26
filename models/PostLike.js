const mongoose = require("mongoose");

const postLikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  parentPostId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
});

module.exports = mongoose.model("PostLike", postLikeSchema);
