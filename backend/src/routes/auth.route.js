const express = require("express")
const router = express.Router()

const { register, login, getMe } = require("../controllers/authController")
const { authenticate } = require("../middleware/authentication")
const { validate } = require("../middleware/validate")
const { authLimiter } = require("../middleware/rateLimiter")
const { registerSchema, loginSchema } = require("../validators/auth")

router.post("/register", authLimiter, validate(registerSchema), register)
router.post("/login", authLimiter, validate(loginSchema), login)
router.get("/me", authenticate, getMe)

module.exports = router
