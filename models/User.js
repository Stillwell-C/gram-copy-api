const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      default: ["User"],
      required: true,
    },
    banned: {
      type: Boolean,
      default: false,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    userImgURL: {
      type: String,
      default: "",
    },
    userBio: {
      type: String,
      default: "",
    },
    likedImgs: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "Post",
    },
    savedImgs: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "Post",
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
    postNo: {
      type: Number,
      default: 0,
    },
    followingNo: {
      type: Number,
      default: 0,
    },
    followersNo: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
