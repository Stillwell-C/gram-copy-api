const { createNewReport } = require("../service/report.services");

const createReport = async (req, res) => {
  const reportingUser = req?.reqID;

  if (!reportingUser) {
    return res.status(400).json({ message: "Must provide reporting user ID" });
  }

  const {
    reportedUser,
    reportedPost,
    reportType,
    reportReason,
    additionalComments,
  } = req.body;

  if (
    (!reportedUser && !reportedPost) ||
    !reportType ||
    !reportReason ||
    !additionalComments
  ) {
    console.log(req.body);
    return res
      .status(400)
      .json({ message: "Must provide all required parameters" });
  }

  const generatedReport = await createNewReport({
    reportingUser,
    reportedUser,
    reportedPost,
    reportType,
    reportReason,
    additionalComments,
  });

  if (!generatedReport) {
    return res.status(400).json({ message: "Invalid data recieved" });
  }

  res.status(201).json({ message: "Report successfully logged." });
};

module.exports = { createReport };
