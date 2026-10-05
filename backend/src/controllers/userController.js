const bcrypt = require("bcrypt")
const { Users, Orders, Order_items } = require("../../models")
const AppError = require("../utils/appError")

const checkEmailIsFree = async (email, ignoreId) => {
  const existingUser = await Users.findOne({ where: { email } })
  if (existingUser && existingUser.id !== ignoreId) {
    throw new AppError("A user with this email already exists", 409)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const users = await Users.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]]
    })

    res.status(200).json({
      success: true,
      count: users.length,
      users
    })
  } catch (error) {
    next(error)
  }
}

const getUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    if (req.user && req.user.role === "customer" && req.user.id !== id) {
      throw new AppError("Forbidden. You can only view your own profile", 403)
    }

    const user = await Users.findByPk(id, {
      attributes: { exclude: ["password"] }
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

const addUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = "customer" } = req.body

    await checkEmailIsFree(email)

    const hashPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS) || 10)

    const newUser = await Users.create({
      name,
      email,
      phone,
      password: hashPassword,
      role
    })

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    if (req.user && (req.user.role === "customer" || req.user.role === "staff") && req.user.id !== id) {
      throw new AppError("Forbidden. You can only update your own profile", 403)
    }

    const user = await Users.findByPk(id)

    if (!user) {
      throw new AppError("User not found", 404)
    }

    const { name, email, phone, password, role } = req.body

    if (email !== undefined) {
      await checkEmailIsFree(email, id)
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined && req.user && req.user.role === "admin") {
      updateData.role = role
    }
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS) || 10)
    }

    await user.update(updateData)

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    if (req.user && (req.user.role === "customer" || req.user.role === "staff") && req.user.id !== id) {
      throw new AppError("Forbidden. You can only delete your own profile", 403)
    }

    const user = await Users.findByPk(id)

    if (!user) {
      throw new AppError("User not found", 404)
    }

    const safeUser = user.toJSON()
    await user.destroy()

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: safeUser
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getUsers, getUser, addUser, updateUser, deleteUser }
