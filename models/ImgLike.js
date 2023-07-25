const mongoose = require("mongoose");

const imgLikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  parentImgId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
});

module.exports = mongoose.model("ImgLike", imgLikeSchema);
