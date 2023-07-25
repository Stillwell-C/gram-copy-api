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
      ref: "UserImg",
    },
    savedImgs: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "UserImg",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
