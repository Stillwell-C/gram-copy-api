const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 create account requests per `window` per minute
  message:
    "Too many login attempts from this IP, please try again after one minute",
  handler: (request, response, next, options) =>
    response.status(options.statusCode).send(options.message),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = loginLimiter;
