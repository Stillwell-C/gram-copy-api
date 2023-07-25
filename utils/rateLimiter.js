const { RateLimiterMongo } = require("rate-limiter-flexible");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/connectDB");

// connectDB()
const mongoConn = mongoose.connection;

// try {
//   mongooseInstance = await mongoose.connect(process.env.DATABASE_URI);
//   mongoConn = mongooseInstance.connection;
// } catch (err) {
//   console.log(err);
// }

const opts = {
  storeClient: mongoConn,
  keyPrefix: "middlewareLimiter",
  points: 5,
  duration: 60 * 60 * 3, // Store number for three hours since first fail
  blockDuration: 60 * 15, // Block for 15 minutes
};

const consecutivePasswordFailLimiter = new RateLimiterMongo(opts);

module.exports = { consecutivePasswordFailLimiter };
