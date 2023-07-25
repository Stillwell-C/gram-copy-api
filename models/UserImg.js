const mongoose = require("mongoose");

const userImgSchema = new mongoose.Schema(
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
    imgUrl: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserImg", userImgSchema);
