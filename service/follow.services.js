const Follow = require("../models/Follow");

const findFollow = async (followedID, followerID) => {
  return Follow.findOne({ followed: followedID, follower: followerID }).exec();
};

const findAllFollowers = async (userID, populate = false, page, limit) => {
  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return Follow.find({ followed: userID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("follower", "_id username fullname userImgKey")
        .select("-followed")
        .lean();
    }

    return Follow.find({ followed: userID })
      .sort("createdAt")
      .populate("follower", "_id username fullname userImgKey")
      .select("-followed")
      .lean();
  } else {
    return Follow.find({ followed: userID }).sort("createdAt").lean();
  }
};

const findAllFollowing = async (userID, populate = false, page, limit) => {
  if (populate) {
    if (page || limit) {
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;

      const skip = (pageInt - 1) * limitInt;

      return Follow.find({ follower: userID })
        .sort("createdAt")
        .limit(limitInt)
        .skip(skip)
        .populate("followed", "_id username fullname userImgKey")
        .select("-follower")
        .lean();
    }

    return Follow.find({ follower: userID })
      .sort("createdAt")
      .populate("followed", "_id username fullname userImgKey")
      .select("-follower")
      .lean();
  } else {
    return Follow.find({ follower: userID }).sort("createdAt").lean();
  }
};

const createNewFollow = async (followedID, followerID) => {
  return Follow.create({ followed: followedID, follower: followerID });
};

const findAndDeleteFollow = async (followID) => {
  return Follow.findByIdAndDelete(followID);
};

const countFollowers = async (userID) => {
  return Follow.countDocuments({ followed: userID });
};

const countFollowing = async (userID) => {
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
