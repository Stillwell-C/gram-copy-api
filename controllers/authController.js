require("dotenv").config();
const { findUserWithPassword } = require("../service/user.services");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyJWTAndReturnUser,
  verifyUsersPassword,
} = require("../service/auth.services");
const { generateSignature } = require("../service/cloudinary.services");

const login = async (req, res) => {
  const { userIdentifier, password } = req.body;

  if (!userIdentifier || !password) {
    return res
      .status(400)
      .json({ message: "Username or email and password required" });
  }

  const user = await findUserWithPassword({
    $or: [{ username: userIdentifier }, { email: userIdentifier }],
  });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.banned) {
    return res
      .status(401)
      .json({ message: "This account has been permanently banned." });
  }

  const passwordMatch = await verifyUsersPassword(password, user._id);

  if (passwordMatch === "EXCEEDED") {
    return res.status(429).json({
      message:
        "Too many attempts with wrong password. Wait 15 minutes before trying again.",
    });
  }
  if (!passwordMatch) {
    return res.status(401).json({ message: "Password incorrect" });
  }

  const accessToken = generateAccessToken(
    user.username,
    user.roles,
    user._id,
    user.userImgKey,
    user.fullname
  );

  const refreshToken = generateRefreshToken(user.username);

  //Send refresh token in a http only cookie
  res.cookie("jwt", refreshToken, {
    //Change later to https
    //Not accessible to JS
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("loggedIn", "true", {
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: true,
  });

  //Send accessToken
  res.json({ accessToken });
};

const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  const verifiedUser = await verifyJWTAndReturnUser(refreshToken);

  if (verifiedUser === "ACCESS FORBIDDEN") {
    return res
      .status(403)
      .json({ message: "Invalid access token. Log in again." });
  }

  if (!verifiedUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accessToken = generateAccessToken(
    verifiedUser?.username,
    verifiedUser?.roles,
    verifiedUser?._id,
    verifiedUser?.userImgKey,
    verifiedUser?.fullname
  );

  res.cookie("loggedIn", "true", {
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.clearCookie("loggedIn", {
    secure: true,
    sameSite: "None",
  });
  res.json({ message: "Cookie cleared" });
};

const getImgCloudSignature = (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = generateSignature(timestamp);
  res.json({ timestamp, signature });
};

module.exports = { login, refresh, logout, getImgCloudSignature };
