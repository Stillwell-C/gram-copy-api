require("dotenv").config();
require("express-async-errors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/connectDB");
const createServer = require("./app");

connectDB();

const app = createServer();

mongoose.connection.once("open", () => {
  console.log("Connected to DB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
