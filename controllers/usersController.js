const User = require("../models/User");
const {
  hashPassword,
  generateAccessToken,
  comparePasswords,
  checkAndVerifyPassword,
} = require("../service/auth.services");
const { deleteImageFromCloudinary } = require("../service/cloudinary.services");
const { findFollow } = require("../service/follow.services");
const { checkValidObjectID } = require("../service/mongoose.services");
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
  findUserByIdWithPassword,
} = require("../service/user.services");
const { consecutivePasswordFailLimiter } = require("../utils/rateLimiter");

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID or username required" });

  const idParse = checkValidObjectID(req.params.id);

  let user = {};
  if (idParse) {
    user = await findUserById(req.params.id);
  }
  if (!user._id) {
    user = await findUserByUsernameWithoutPassword(req.params.id);
  }

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }

  const userObj = user.toObject();

  userObj.isFollow = false;

  const reqID = req.reqID;
  if (reqID && user._id !== reqID) {
    const follow = await findFollow(user._id, reqID);
    if (follow) userObj.isFollow = true;
  }

  res.json(userObj);
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

  res.json({ users: results });
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
  if (!req?.body?.id) {
    return res.status(400).json({ message: "User ID parameter required" });
  }

  const {
    id,
    username,
    oldPassword,
    newPassword,
    roles,
    banned,
    email,
    fullname,
    userImgKey,
  } = req.body;

  if (
    !username &&
    !oldPassword &&
    !newPassword &&
    !roles &&
    !banned &&
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
    // const user = await findUserByIdWithPassword(id);

    // const rateLimitUser = await consecutivePasswordFailLimiter.get(
    //   user.username
    // );

    // if (rateLimitUser !== null && rateLimitUser?.consumedPoints > 5) {
    //   return res.status(429).json({
    //     message:
    //       "Too many attempts with wrong password. Wait 15 minutes before trying again.",
    //   });
    // }

    // const passwordMatch = await comparePasswords(oldPassword, user.password);

    const passwordMatch = await checkAndVerifyPassword(oldPassword, id);

    if (!passwordMatch) {
      await consecutivePasswordFailLimiter.consume(user.username);

      return res.status(401).json({ message: "Old password incorrect" });
    } else if (rateLimitUser !== null && rateLimitUser?.consumedPoints > 0) {
      await consecutivePasswordFailLimiter.delete(user.username);
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

  //Fields not requiring special processing
  // const updateFields = [{ roles }, { banned }, { fullname }, { userImgKey }];
  // for (const [key, value] of Object.entries(updateFields)) {
  //   if (key && value) {
  //     updateObj[key] = value;
  //   }
  // }

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
  const { id, adminPassword } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  if (adminPassword && adminPassword !== process.env.ADMINPASS) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const deletedUser = await findAndDeleteUser(id);

  if (!deletedUser) {
    return res.status(400).json({ message: "User not found" });
  }

  res.json({
    message: `User ${deletedUser.username} successfully deleted`,
  });
};

module.exports = {
  getUser,
  getUsersFromArr,
  getAllUsers,
  searchUsers,
  createNewUser,
  updateUserInfo,
  deleteUser,
};
