const express = require("express")
const cors = require("cors")
const app = express()

const logger = require("./middleware/logger")
const errorHandler = require("./middleware/error")
const notFound = require("./middleware/notFound")
const { apiLimiter } = require("./middleware/rateLimiter")

const authRoutes = require("./routes/auth.route")
const userRoutes = require("./routes/user.route")
const categoryRoutes = require("./routes/category.route")
const menuItemRoutes = require("./routes/menuItem.route")
const orderRoutes = require("./routes/order.route")

app.use(cors())
app.use(logger)
app.use(express.json({ limit: "10kb" }))

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, Restaurant Management System API is running"
  })
})

app.use("/api", apiLimiter)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/menu-items", menuItemRoutes)
app.use("/api/orders", orderRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
