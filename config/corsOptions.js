const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    //Will allow req from things like postman
    //May remove for production
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
