const Report = require("../models/Report");
const { checkValidObjectID } = require("./mongoose.services");

const createNewReport = async ({
  reportingUser,
  reportedUser,
  reportedPost,
  ...args
}) => {
  const reportObj = { reportingUser, ...args };
  const reportingUserCheck = checkValidObjectID(reportingUser);
  if (!reportingUserCheck) return;
  if (reportedUser) {
    const reportedUserCheck = checkValidObjectID(reportedUser);
    if (!reportedUserCheck) return;
    reportObj.reportedUser = reportedUser;
  }
  if (reportedPost) {
    const reportedPostCheck = checkValidObjectID(reportedPost);
    if (!reportedPostCheck) return;
    reportObj.reportedPost = reportedPost;
  }
  return await Report.create(reportObj);
};

module.exports = { createNewReport };
