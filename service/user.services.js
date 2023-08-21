const User = require("../models/User");

const findUser = async (query) => {
  return User.find(query).select("-password").lean().exec();
};

const findUserWithPassword = async (query) => {
  return User.find(query).lean().exec();
};

const findUserById = async (userId) => {
  return User.findById(userId).select("-password").lean().exec();
};

const findUserByIdMinimalData = async (userId) => {
  return User.findById(userId)
    .select("username")
    .select("fullname")
    .select("userImgKey")
    .lean()
    .exec();
};

const findUserByUsernameWithoutPassword = async (username) => {
  return User.findOne({ username }).select("-password").exec();
};

const findMultipleUsers = async (page, limit) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const postsSkip = (pageInt - 1) * limitInt;

    return User.find()
      .sort("username")
      .limit(limitInt)
      .skip(postsSkip)
      .select("-password")
      .lean()
      .exec();
  } else {
    return User.find().sort("username").select("-password").lean();
  }
};

const searchUser = async (searchQuery, page, limit) => {
  const pageInt = parseInt(page) || 1;
  const limitInt = parseInt(limit) || 10;

  const postsSkip = (pageInt - 1) * limitInt;

  return User.find({
    $or: [
      { fullname: { $regex: searchQuery, $options: "i" } },
      { username: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
    ],
  })
    .limit(limitInt)
    .skip(postsSkip)
    .select("_id")
    .select("username")
    .select("userImgKey")
    .select("fullname");
};

const duplicateUsernameCheck = async (username) => {
  return User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
};

const duplicateEmailCheck = async (email) => {
  return User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
};

const generateNewUser = async (newUser) => {
  return User.create(newUser);
};

const findAndUpdateUser = async (id, updateObj) => {
  return User.findOneAndUpdate({ _id: id }, { ...updateObj }, { new: true });
};

const findAndUpdateArr = async (id, arrCommand) => {
  return User.findByIdAndUpdate(id, arrCommand, { new: true });
};

const findAndDeleteUser = async (id) => {
  return User.findByIdAndDelete(id).exec();
};

module.exports = {
  findUser,
  findUserWithPassword,
  findUserById,
  findUserByIdMinimalData,
  findUserByUsernameWithoutPassword,
  findMultipleUsers,
  searchUser,
  duplicateUsernameCheck,
  duplicateEmailCheck,
  generateNewUser,
  findAndUpdateUser,
  findAndUpdateArr,
  findAndDeleteUser,
};
