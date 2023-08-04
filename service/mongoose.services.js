const mongoose = require("mongoose");

const checkValidObjectID = (testID) => {
  return mongoose.isValidObjectId(testID);
};

module.exports = { checkValidObjectID };
