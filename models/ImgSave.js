const mongoose = require("mongoose");

const imgSaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  parentImgId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "UserImg",
  },
});

module.exports = mongoose.model("ImgSave", imgSaveSchema);
