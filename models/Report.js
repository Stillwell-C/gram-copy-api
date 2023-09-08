const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportingUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reportedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    reportType: {
      type: String,
      required: true,
    },
    reportReason: {
      type: String,
      required: true,
    },
    additionalComments: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
