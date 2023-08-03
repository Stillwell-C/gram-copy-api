const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findUserByUsernameWithoutPassword } = require("./user.services");
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

const exportFunctions = {
  generateAccessToken,
  generateRefreshToken,
  verifyJWTAndReturnUser,
  hashPassword,
  comparePasswords,
};

module.exports = exportFunctions;
