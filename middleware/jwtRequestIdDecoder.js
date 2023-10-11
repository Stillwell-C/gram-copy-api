const jwt = require("jsonwebtoken");

const jwtReqestIdDecoder = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const cookies = req.headers.cookie;

  if (!req.originalURL.match(/^\/auth\/refresh/i)) {
    if (cookies?.loggedIn && !authHeader?.includes("Bearer ")) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  if (authHeader?.includes("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_CODE, (err, decoded) => {
      //verifying JWT for specific routes will happen with a different middleware
      //Catching error here is not important
      if (!err) {
        req.reqID = decoded.UserInfo.id;
      }
    });
  }

  next();
};

module.exports = jwtReqestIdDecoder;
