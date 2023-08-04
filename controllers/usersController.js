const User = require("../models/User");
const {
  hashPassword,
  generateAccessToken,
} = require("../service/auth.services");
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
} = require("../service/user.services");

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID or username required" });

  const idParse = checkValidObjectID(req.params.id);

  let user;
  if (idParse) {
    user = await findUserById(req.params.id);
  }
  if (!user) {
    user = await findUserByUsernameWithoutPassword(req.params.id);
  }

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }
  res.json(user);
};

const getAllUsers = async (req, res) => {
  const { page, limit } = req.query;

  const users = await findMultipleUsers(page, limit);

  const totalUsers = await User.countDocuments();

  if (!users) return res.status(400).json({ message: "No users found" });

  res.json({ users, totalUsers });
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

  const { id, username, password, roles, banned, email, fullname, userImgURL } =
    req.body;

  //An array on the user will be updated
  //Action values will be 1 to add -1 to remove
  //UpdateField corresponds to an array on user model such as likedImgs
  // if (updateField?.length) {
  //   if (!postID && !userID) {
  //     return res
  //       .status(400)
  //       .json({ message: "A User ID or Post ID parameter is required" });
  //   }

  //   if (!updateField || !actionValue) {
  //     return res.status(400).json({ message: "Update parameters required" });
  //   }

  //   const updateID = postID ? postID : userID;

  //   let updatedUser;
  //   if (actionValue > 0) {
  //     //Ensure that same value does not already exist
  //     const duplicateValueCheck = await findUser({
  //       _id: id,
  //       [updateField]: { $in: [updateID] },
  //     });
  //     if (duplicateValueCheck.length) {
  //       return res
  //         .status(400)
  //         .json({ message: "This value already exists on this user" });
  //     }

  //     updatedUser = await findAndUpdateArr(id, {
  //       $push: { [updateField]: updateID },
  //     });
  //   } else {
  //     updatedUser = await findAndUpdateArr(id, {
  //       $pull: { [updateField]: updateID },
  //     });
  //   }

  //   if (!updatedUser) {
  //     return res.status(400).json({ message: "Parameter not found" });
  //   }

  //   return res
  //     .status(200)
  //     .json({ message: `User's ${updateField} has been updated` });
  // }

  //If array is not updated, other fields on user model will be updated
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
  if (password) {
    const hashedPassword = await hashPassword(password);
    updateObj.password = hashedPassword;
  }
  //Fields not requiring special processing
  const updateFields = [roles, banned, fullname, userImgURL];
  for (const field of updateFields) {
    if (field) {
      updateObj[field] = field;
    }
  }

  const updatedUser = await findAndUpdateUser(id, updateObj);

  if (!updatedUser) {
    return res.status(400).json({ message: "Invalid data received" });
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
  getAllUsers,
  createNewUser,
  updateUserInfo,
  deleteUser,
};
