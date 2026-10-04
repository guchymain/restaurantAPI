const jwt = require("jsonwebtoken")
const { Users } = require("../../models")

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    // Make sure the account still exists
    const user = await Users.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      })
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
    })
  }
}

// Optional authentication middleware: if token is supplied, verify and attach user; otherwise proceed
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    const user = await Users.findByPk(decoded.id)
    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }

  next()
}

module.exports = { authenticate, optionalAuthenticate }
