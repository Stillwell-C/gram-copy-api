const Follow = require("../models/Follow");
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

const getAllFollowers = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;
  const reqID = req.reqID;

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

  if (reqID) {
    for (const follower of filteredFollowers) {
      let follow = false;
      if (follower?.follower?._id) {
        if (follower?.follower?._id !== reqID) {
          follow = await findFollow(follower?.follower?._id, reqID);
        }

        follower.follower.isFollow = follow ? true : false;
      }
    }
  } else {
    for (const follower of filteredFollowers) {
      follower.follower.isFollow = false;
    }
  }

  const totalFollowers = await countFollowers(id);

  if (page && limit) {
    const totalPages = Math.ceil(totalFollowers / limit);
    return res.json({ followers, totalFollowers, limit, page, totalPages });
  }

  res.json({ followers, totalFollowers });
};

const getAllFollowing = async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req?.query;
  const reqID = req.reqID;

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

  if (reqID) {
    for (const followedUser of filteredFollowing) {
      let follow = false;
      if (followedUser?.followed?._id) {
        if (followedUser.followed._id !== reqID)
          follow = await findFollow(followedUser.followed._id, reqID);

        followedUser.followed.isFollow = follow ? true : false;
      }
    }
  } else {
    for (const followedUser of filteredFollowing) {
      followedUser.followed.isFollow = false;
    }
  }

  const totalFollowing = await countFollowing(id);

  if (page && limit) {
    const totalPages = Math.ceil(totalFollowing / limit);
    return res.json({ following, totalFollowing, limit, page, totalPages });
  }

  res.json({ following, totalFollowing });
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
  getAllFollowers,
  getAllFollowing,
  createFollow,
  deleteFollow,
};
