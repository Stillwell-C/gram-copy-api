const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    altText: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    imgKey: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: "",
    },
    taggedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
      validate: [
        (arr) => arr.lenth <= 20,
        "Tagged Users exceeds maximum of 20",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
