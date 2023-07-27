const Follow = require("../models/Follow");
const {
  findAllFollowers,
  findAllFollowing,
  createNewFollow,
  findFollow,
  findAndDeleteFollow,
} = require("../service/follow.services");
const { findAndUpdateUser } = require("../service/user.services");

const getAllFollowers = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const followers = await findAllFollowers(id, true, page, limit);

  if (!followers) {
    return res.status(400).json({ message: "No followers found" });
  }

  res.json(followers);
};

const getAllFollowing = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const followers = await findAllFollowing(id, true, page, limit);

  if (!followers) {
    return res.status(400).json({ message: "No followers found" });
  }

  res.json(followers);
};

const createFollow = async (req, res) => {
  const { followedID, followerID } = req.body;

  if (!followedID || !followerID) {
    return res
      .status(400)
      .json({ message: "Must include a followerID and a followedID" });
  }

  if (followedID === followerID) {
    return res.status(400).json({ message: "User cannot follow self" });
  }

  const followCheck = await findFollow(followedID, followerID);

  if (followCheck) {
    return res.status(400).json({ message: "Already following this user" });
  }

  const follow = await createNewFollow(followedID, followerID);

  if (!follow) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }

  const followerUpdate = await findAndUpdateUser(
    followerID,
    { $inc: { followingNo: 1 } },
    false
  );
  const followedUpdate = await findAndUpdateUser(
    followedID,
    { $inc: { followerNo: 1 } },
    false
  );

  if (!followerUpdate) {
    return res
      .status(400)
      .json({ message: "Following user's following count not updated" });
  }
  if (!followedUpdate) {
    return res
      .status(400)
      .json({ message: "Followed user's follower count not updated" });
  }

  return res.status(201).json({ message: "Followed user" });
};

const deleteFollow = async (req, res) => {
  const { followerID, followedID } = req.body;

  const follow = await findFollow(followedID, followerID);

  if (!follow) {
    return res.status(400).json({ message: "Not following this user" });
  }

  const deletedFollow = await findAndDeleteFollow(follow._id);

  if (!deletedFollow) {
    return res
      .status(400)
      .json({ message: "Could not unfollow user. Please try again." });
  }

  const followerUpdate = await findAndUpdateUser(
    followerID,
    { $inc: { followingNo: -1 } },
    false
  );
  const followedUpdate = await findAndUpdateUser(
    followedID,
    { $inc: { followerNo: -1 } },
    false
  );

  if (!followerUpdate) {
    return res
      .status(400)
      .json({ message: "Following user's following count not updated" });
  }
  if (!followedUpdate) {
    return res
      .status(400)
      .json({ message: "Followed user's follower count not updated" });
  }

  return res.json({ message: "Unfollowed user" });
};

module.exports = {
  getAllFollowers,
  getAllFollowing,
  createFollow,
  deleteFollow,
};
