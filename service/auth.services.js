const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  findUserByUsernameWithoutPassword,
  findUserByIdWithPassword,
} = require("./user.services");
const { consecutivePasswordFailLimiter } = require("../utils/rateLimiter");
require("dotenv").config();

const generateAccessToken = (username, roles, id, img, fullname) => {
  return jwt.sign(
    {
      UserInfo: {
        username,
        roles,
        id,
        img,
        fullname,
      },
    },
    process.env.ACCESS_TOKEN_CODE,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (username) => {
  return jwt.sign({ username }, process.env.REFRESH_TOKEN_CODE, {
    expiresIn: "7d",
  });
};

const verifyJWTAndReturnUser = async (refreshToken) => {
  return jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_CODE,
    async (err, decoded) => {
      if (err) {
        return "ACCESS FORBIDDEN";
      }

      const verifiedUser = await findUserByUsernameWithoutPassword(
        decoded.username
      );

      return verifiedUser;
    }
  );
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePasswords = async (enteredPassword, userPassword) => {
  return bcrypt.compare(enteredPassword, userPassword);
};

const verifyUsersPassword = async (enteredPassword, userID) => {
  const user = await findUserByIdWithPassword(userID);

  const rateLimitUser = await consecutivePasswordFailLimiter.get(user.username);

  if (rateLimitUser !== null && rateLimitUser?.consumedPoints > 5) {
    return "EXCEEDED";
  }

  const passwordCheck = await comparePasswords(enteredPassword, user.password);

  if (!passwordCheck) {
    try {
      await consecutivePasswordFailLimiter.consume(user.username);
    } catch (err) {
      console.log(err);
      return false;
    }
    return false;
  } else if (rateLimitUser !== null && rateLimitUser?.consumedPoints > 0) {
    try {
      await consecutivePasswordFailLimiter.delete(user.username);
    } catch (err) {
      console.log(err);
      return true;
    }
    return true;
  }
};

const exportFunctions = {
  generateAccessToken,
  generateRefreshToken,
  verifyJWTAndReturnUser,
  hashPassword,
  comparePasswords,
  verifyUsersPassword,
};

module.exports = exportFunctions;
