const sendApiResponse = (
  res,
  statusCode,
  message,
  data = null,
  error = null
) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    error,
  };

  return res.status(statusCode).json(response);
};

module.exports = sendApiResponse;
