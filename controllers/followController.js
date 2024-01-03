const {
  findAllFollowers,
  findAllFollowing,
  createNewFollow,
  findFollow,
  findAndDeleteFollow,
  countFollowers,
  countFollowing,
} = require("../service/follow.services");
const { createNotification } = require("../service/notification.services");
const { findAndUpdateUser } = require("../service/user.services");

const getFollow = async (req, res) => {
  const { id } = req.params;
  const reqID = req.reqID;

  const follow = await findFollow(id, reqID);
  const isFollow = follow ? true : false;

  return res.json({ isFollow });
};

const getAllFollowers = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const followers = await findAllFollowers(id, true, page, limit);

  //Filter out any empty returns
  const filteredFollowers = followers.filter((follower) => {
    if (follower?.follower?._id) {
      return true;
    }

    return false;
  });

  if (!filteredFollowers.length) {
    return res.status(400).json({ message: "No followers found" });
  }

  const totalFollowers = await countFollowers(id);

  if (page && limit) {
    const totalPages = Math.ceil(totalFollowers / limit);
    return res.json({ followers, totalFollowers, limit, page, totalPages });
  }

  res.json({ followers, totalFollowers });
};

const getFollowerCount = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Must include userID" });
  }

  const followerCount = await countFollowers(id);

  res.json({ followerCount });
};

const getAllFollowing = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;

  const following = await findAllFollowing(id, true, page, limit);

  //Filter out any empty returns
  const filteredFollowing = following.filter((follow) => {
    if (follow?.followed?._id) {
      return true;
    }

    return false;
  });

  if (!filteredFollowing.length) {
    return res.status(400).json({ message: "No following users found" });
  }

  const totalFollowing = await countFollowing(id);

  if (page && limit) {
    const totalPages = Math.ceil(totalFollowing / limit);
    return res.json({ following, totalFollowing, limit, page, totalPages });
  }

  res.json({ following, totalFollowing });
};

const getFollowingCount = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Must include userID" });
  }

  const followingCount = await countFollowing(id);

  res.json({ followingCount });
};

const createFollow = async (req, res) => {
  const { followedID } = req.body;
  const followerID = req?.reqID;

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

  createNotification({
    notifiedUser: followedID,
    notifyingUser: followerID,
    notificationType: "FOLLOW",
  });

  return res.status(201).json({ message: "Followed user" });
};

const deleteFollow = async (req, res) => {
  const { followedID } = req.body;
  const followerID = req?.reqID;

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
  getFollow,
  getAllFollowers,
  getFollowerCount,
  getAllFollowing,
  getFollowingCount,
  createFollow,
  deleteFollow,
};
