const Follow = require("../models/Follow");
const { checkValidObjectID } = require("./mongoose.services");

const findFollow = async (followedID, followerID) => {
  const followerIdCheck = checkValidObjectID(followerID);
  const followedIdCheck = checkValidObjectID(followedID);
  if (!followerIdCheck || !followedIdCheck) return;

  return Follow.findOne({ followed: followedID, follower: followerID }).exec();
};

const findAllFollowers = async (userID, populate = false, page, limit) => {
  const idCheck = checkValidObjectID(userID);
  if (!idCheck) return;

  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return Follow.find({ followed: userID })
        .sort({ createdAt: 1, _id: 1 })
        .limit(limitInt)
        .skip(skip)
        .populate("follower", "_id username fullname userImgKey")
        .select("-followed")
        .lean();
    }

    return Follow.find({ followed: userID })
      .sort({ createdAt: 1, _id: 1 })
      .populate("follower", "_id username fullname userImgKey")
      .select("-followed")
      .lean();
  } else {
    return Follow.find({ followed: userID })
      .sort({ createdAt: 1, _id: 1 })
      .lean();
  }
};

const findAllFollowing = async (userID, populate = false, page, limit) => {
  const idCheck = checkValidObjectID(userID);
  if (!idCheck) return;

  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return Follow.find({ follower: userID })
        .sort({ createdAt: 1, _id: 1 })
        .limit(limitInt)
        .skip(skip)
        .populate("followed", "_id username fullname userImgKey")
        .select("-follower")
        .lean();
    }

    return Follow.find({ follower: userID })
      .sort({ createdAt: 1, _id: 1 })
      .populate("followed", "_id username fullname userImgKey")
      .select("-follower")
      .lean();
  } else {
    return Follow.find({ follower: userID })
      .sort({ createdAt: 1, _id: 1 })
      .lean();
  }
};

const createNewFollow = async (followedID, followerID) => {
  const followerIdCheck = checkValidObjectID(followerID);
  const followedIdCheck = checkValidObjectID(followedID);
  if (!followerIdCheck || !followedIdCheck) return;

  return Follow.create({ followed: followedID, follower: followerID });
};

const findAndDeleteFollow = async (followID) => {
  const idCheck = checkValidObjectID(followID);
  if (!idCheck) return;

  return Follow.findByIdAndDelete(followID);
};

const countFollowers = async (userID) => {
  const idCheck = checkValidObjectID(userID);
  if (!idCheck) return;

  return Follow.countDocuments({ followed: userID });
};

const countFollowing = async (userID) => {
  const idCheck = checkValidObjectID(userID);
  if (!idCheck) return;

  return Follow.countDocuments({ follower: userID });
};

module.exports = {
  findFollow,
  findAllFollowers,
  findAllFollowing,
  createNewFollow,
  findAndDeleteFollow,
  countFollowers,
  countFollowing,
};
