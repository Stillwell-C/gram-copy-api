require("dotenv").config();
const { findUserWithPassword } = require("../service/user.services");
const {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  verifyJWTAndReturnUser,
} = require("../service/auth.services");
const { consecutivePasswordFailLimiter } = require("../utils/rateLimiter");
const { generateSignature } = require("../service/cloudinary.services");

const login = async (req, res) => {
  const { userIdentifier, password } = req.body;

  if (!userIdentifier || !password) {
    return res
      .status(400)
      .json({ message: "Username or email and password required" });
  }

  const [user] = await findUserWithPassword({
    $or: [{ username: userIdentifier }, { email: userIdentifier }],
  });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const rateLimitUser = await consecutivePasswordFailLimiter.get(user.username);

  if (rateLimitUser !== null && rateLimitUser?.consumedPoints > 5) {
    return res.status(429).json({
      message:
        "Too many attempts with wrong password. Wait 15 minutes before trying again.",
    });
  }

  const passwordMatch = await comparePasswords(password, user.password);

  if (!passwordMatch) {
    await consecutivePasswordFailLimiter.consume(user.username);

    return res.status(401).json({ message: "Password incorrect" });
  } else if (rateLimitUser !== null && rateLimitUser?.consumedPoints > 0) {
    await consecutivePasswordFailLimiter.delete(user.username);
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
    return res.status(403).json({ message: "Forbidden" });
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

  res.json({ accessToken });
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

const getImgCloudSignature = async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = generateSignature(timestamp);
  res.json({ timestamp, signature });
};

module.exports = { login, refresh, logout, getImgCloudSignature };
