const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const errorHandler = require("./middleware/errorHandler");
const jwtReqestIdDecoder = require("./middleware/jwtRequestIdDecoder");

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(jwtReqestIdDecoder);

  app.use("/", express.static(path.join(__dirname, "public")));
  app.use("/", require("./routes/root"));
  app.use("/users", require("./routes/userRoutes"));
  app.use("/auth", require("./routes/authRoutes"));
  app.use("/posts", require("./routes/postRoutes"));
  app.use("/postlike", require("./routes/postLikeRoutes"));
  app.use("/postsave", require("./routes/postSaveRoutes"));
  app.use("/comments", require("./routes/commentRoutes"));
  app.use("/follow", require("./routes/followRoutes"));
  app.use("/notifications", require("./routes/notificationsRoutes"));
  app.use("/reports", require("./routes/reportRoutes"));

  app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
      res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
      res.json({ message: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
  });

  app.use(errorHandler);

  return app;
};

module.exports = createServer;
