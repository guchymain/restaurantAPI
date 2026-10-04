const { rateLimit } = require("express-rate-limit")

const limitReached = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later"
  })
}

// Strict limit for login and register to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitReached
})

// General limit for the rest of the API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitReached
})

module.exports = { authLimiter, apiLimiter }
