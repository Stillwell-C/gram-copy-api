const User = require("../models/User");
const {
  hashPassword,
  generateAccessToken,
  verifyUsersPassword,
} = require("../service/auth.services");
const { deleteImageFromCloudinary } = require("../service/cloudinary.services");
const {
  findFollow,
  findAndDeleteFollow,
  findAllFollowing,
  findAllFollowers,
} = require("../service/follow.services");
const { checkValidObjectID } = require("../service/mongoose.services");
const { findAndDeleteAllUserPosts } = require("../service/post.services");
const { client } = require("../service/redis/client");
const {
  duplicateEmailCheck,
  duplicateUsernameCheck,
  generateNewUser,
  findAndUpdateUser,
  findAndDeleteUser,
  findMultipleUsers,
  findUserById,
  findUserByUsernameWithoutPassword,
  searchUser,
  findUserByIdMinimalData,
  countSearchedUsers,
  findPopularUsers,
  testUserCheck,
} = require("../service/user.services");

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID or username required" });

  const idParse = checkValidObjectID(req.params.id);

  let user = {};
  if (idParse) {
    user = await findUserById(req.params.id);
  }
  if (!user?._id) {
    user = await findUserByUsernameWithoutPassword(req.params.id);
  }

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }

  const userObj = user.toObject();

  userObj.isFollow = false;
  delete userObj.email;

  const reqID = req.reqID;
  if (reqID && user._id !== reqID) {
    const follow = await findFollow(user._id, reqID);
    if (follow) userObj.isFollow = true;
  }

  res.json(userObj);
};

const getPopularUsers = async (req, res) => {
  const cachedUserData = await client.get("popularUsers");
  if (cachedUserData) {
    const parsedUserData = JSON.parse(cachedUserData);
    return res.json(parsedUserData);
  }

  const popularUsers = await findPopularUsers();

  if (!popularUsers) {
    return res.status(400).json({ message: "Popular users list not found" });
  }

  await client.set("popularUsers", JSON.stringify(popularUsers), {
    EX: 60 * 60 * 24,
  });

  res.json(popularUsers);
};

const getOwnUserData = async (req, res) => {
  if (!req.reqID) {
    return res
      .status(401)
      .json({ message: "Must be signed in to access this data" });
  }

  const user = await findUserById(req.reqID);

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }

  res.json(user);
};

const emailAvailability = async (req, res) => {
  if (!req?.params?.email) {
    return res.status(400).json({ message: "User email required" });
  }

  const user = await duplicateEmailCheck(req.params.email);

  if (!user) {
    return res.json({ availability: true });
  }

  return res.json({ availability: false });
};

const usernameAvailability = async (req, res) => {
  if (!req?.params?.username) {
    return res.status(400).json({ message: "User username required" });
  }
  const user = await duplicateUsernameCheck(req.params.username);

  if (!user) {
    return res.json({ availability: true });
  }

  return res.json({ availability: false });
};

const getUsersFromArr = async (req, res) => {
  if (!req?.params?.userArr) {
    return res.status(400).json({ message: "User array required" });
  }

  const reqArr = req.params.userArr.split(",");

  const resUserArr = [];
  for (const userID of reqArr) {
    const userData = await findUserByIdMinimalData(userID);
    if (userData) resUserArr.push(userData);
  }

  res.json(resUserArr);
};

const getAllUsers = async (req, res) => {
  const { page, limit } = req.query;

  const users = await findMultipleUsers(page, limit);

  const totalUsers = await User.countDocuments();

  if (!users) return res.status(400).json({ message: "No users found" });

  res.json({ users, totalUsers });
};

const searchUsers = async (req, res) => {
  const { searchQuery } = req.params;
  const { page, limit } = req.query;

  if (!searchQuery)
    return res.status(400).json({ message: "Search query required" });

  const results = await searchUser(searchQuery, page, limit);

  if (!results) return res.status(404).json({ message: "No results found" });

  const totalUsers = await countSearchedUsers(searchQuery);

  if (page && limit) {
    const totalPages = Math.ceil(totalUsers / limit);
    return res.json({ users: results, totalUsers, limit, page, totalPages });
  }

  res.json({ users: results, totalUsers });
};

const createNewUser = async (req, res) => {
  const { username, password, email, fullname } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password required" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  if (!fullname) {
    return res.status(400).json({ message: "Full name required" });
  }

  const duplicateUsername = await duplicateUsernameCheck(username);

  if (duplicateUsername) {
    return res.status(409).json({ message: "Username not available" });
  }

  const duplicateEmail = await duplicateEmailCheck(email);

  if (duplicateEmail) {
    return res
      .status(409)
      .json({ message: "An account already exists for this email" });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = { username, password: hashedPassword, email, fullname };

  const createdUser = await generateNewUser(newUser);

  if (createdUser) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
};

const updateUserInfo = async (req, res) => {
  const id = req?.reqID;

  const {
    username,
    oldPassword,
    newPassword,
    userBio,
    roles,
    banned,
    email,
    fullname,
    userImgKey,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID parameter required" });
  }

  if (
    !username &&
    !oldPassword &&
    !newPassword &&
    !roles &&
    !banned &&
    !userBio &&
    !email &&
    !fullname &&
    !userImgKey
  ) {
    return res.status(400).json({
      message: "Must submit a profile information parameter to update profile",
    });
  }

  const updateObj = {};
  if (username) {
    const restrictedID = testUserCheck(id);
    if (restrictedID) {
      return res
        .status(401)
        .json({ message: "Unauthorized action on test account" });
    }

    const duplicate = await duplicateUsernameCheck(username);
    if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Username not available" });
    }
    updateObj.username = username;
  }
  if (email) {
    const duplicate = await duplicateEmailCheck(email);
    if (duplicate && duplicate?._id.toString() !== id) {
      return res
        .status(409)
        .json({ message: "An account already exists for this email" });
    }
    updateObj.email = email;
  }
  if (newPassword && oldPassword) {
    const restrictedID = testUserCheck(id);
    if (restrictedID) {
      return res
        .status(401)
        .json({ message: "Unauthorized action on test account" });
    }

    const passwordMatch = await verifyUsersPassword(oldPassword, id);

    if (passwordMatch === "EXCEEDED") {
      return res.status(429).json({
        message:
          "Too many attempts with wrong password. Wait 15 minutes before trying again.",
      });
    }
    if (!passwordMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }
    const hashedPassword = await hashPassword(newPassword);
    updateObj.password = hashedPassword;
  }
  if (roles) updateObj.roles = roles;
  if (banned) updateObj.banned = banned;
  if (fullname) updateObj.fullname = fullname;
  let previousImgKey = null;
  if (userImgKey) {
    updateObj.userImgKey = userImgKey;
    const user = await findUserById(id);
    previousImgKey = user.userImgKey;
  }
  if (userBio) updateObj.userBio = userBio;

  const updatedUser = await findAndUpdateUser(id, updateObj);

  if (!updatedUser) {
    return res.status(400).json({ message: "Invalid data received" });
  }

  if (previousImgKey) {
    deleteImageFromCloudinary(previousImgKey);
  }

  const accessToken = generateAccessToken(
    updatedUser.username,
    updatedUser.roles,
    updatedUser._id,
    updatedUser.userImgKey,
    updatedUser.fullname
  );

  res.json({ accessToken });
};

const deleteUser = async (req, res) => {
  const id = req?.reqID;
  const { adminPassword, userPassword } = req.body;

  const restrictedID = testUserCheck(id);
  if (restrictedID) {
    return res
      .status(401)
      .json({ message: "Unauthorized action on test account" });
  }

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  if (!adminPassword && !userPassword) {
    return res.status(400).json({ message: "Password required" });
  }

  if (adminPassword && adminPassword !== process.env.ADMINPASS) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  if (userPassword) {
    const userPasswordCheck = await verifyUsersPassword(userPassword, id);

    if (userPasswordCheck === "EXCEEDED") {
      return res.status(429).json({
        message:
          "Too many attempts with wrong password. Wait 15 minutes before trying again.",
      });
    }

    if (!userPasswordCheck) {
      return res.status(401).json({ message: "Incorrect password" });
    }
  }

  const deletedUser = await findAndDeleteUser(id);

  if (!deletedUser) {
    return res.status(400).json({ message: "User not found" });
  }

  //Delete user posts
  await findAndDeleteAllUserPosts(id);

  //Delete all instances of user follows
  const following = await findAllFollowing(id);

  for (const follow of following) {
    await findAndUpdateUser(follow.followed, {
      $inc: { followerNo: -1 },
    });

    await findAndDeleteFollow(follow._id);
  }

  const followers = await findAllFollowers(id);

  for (const follow of followers) {
    await findAndUpdateUser(follow.follower, {
      $inc: { followingNo: -1 },
    });

    await findAndDeleteFollow(follow._id);
  }

  res.status(200).json({
    message: `User ${deletedUser.username} successfully deleted`,
  });
};

module.exports = {
  getUser,
  getOwnUserData,
  getUsersFromArr,
  getAllUsers,
  getPopularUsers,
  emailAvailability,
  usernameAvailability,
  searchUsers,
  createNewUser,
  updateUserInfo,
  deleteUser,
};
