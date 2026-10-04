const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true })

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing")
  process.exit(1)
}

const app = require("./app")
const { sequelize } = require("../models")

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("PostgreSQL Database connected successfully")

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to connect to the database:", error)
    process.exit(1)
  }
}

startServer()
