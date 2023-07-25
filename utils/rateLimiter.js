const { RateLimiterMongo } = require("rate-limiter-flexible");
const mongoose = require("mongoose");
require("dotenv").config();

const mongoConn = mongoose.connection;

const opts = {
  storeClient: mongoConn,
  keyPrefix: "middlewareLimiter",
  points: 5,
  duration: 60 * 60 * 3, // Store number for three hours since first fail
  blockDuration: 60 * 15, // Block for 15 minutes
};

const consecutivePasswordFailLimiter = new RateLimiterMongo(opts);

module.exports = { consecutivePasswordFailLimiter };
