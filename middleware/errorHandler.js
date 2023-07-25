const errorHandler = (err, req, res, next) => {
  console.log("Error handler called");
  console.log(err);

  const status = res.statusCode ? res.statusCode : 500;

  res.status(status);

  res.json({ message: err.message, status: status, isError: true });
};

module.exports = errorHandler;
