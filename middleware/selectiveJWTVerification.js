const jwt = require("jsonwebtoken");

//This will only check for verification if reqID is present on req object
//This will allow unverified requests to pass through when verification is unnecessary
const selectiveJWTVerification = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.includes("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_CODE, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    next();
  });
};

module.exports = selectiveJWTVerification;
