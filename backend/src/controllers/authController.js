const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Users } = require("../../models")
const AppError = require("../utils/appError")

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = "customer" } = req.body

    const existingUser = await Users.findOne({ where: { email } })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists"
      })
    }

    const hashPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS) || 10)

    const newUser = await Users.create({
      name,
      email,
      phone,
      password: hashPassword,
      role
    })

    const token = jwt.sign(
      {
        id: newUser.id,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
      }
    )

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser.toJSON(),
      token
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await Users.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
      }
    )

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: user.toJSON(),
      token
    })
  } catch (error) {
    next(error)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    })

    if (!user) {
      throw new AppError("User no longer exists", 401)
    }

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, getMe }
