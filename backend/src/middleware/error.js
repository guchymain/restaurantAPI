const errorHandler = (err, req, res, next) => {
  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body"
    })
  }

  const statusCode = err.statusCode || err.status || 500

  // Only show messages we created ourselves; hide internal details
  const isSafe = err.isOperational || (err.expose && statusCode < 500)

  if (!isSafe) {
    console.error(err.stack)
  }

  res.status(statusCode).json({
    success: false,
    message: isSafe ? err.message : "Internal server error"
  })
}

module.exports = errorHandler
