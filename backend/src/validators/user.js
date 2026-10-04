const { z } = require("zod")
const { name, email, phone, atLeastOneField } = require("./common")

const password = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string"
  })
  .min(6, "Password must be at least 6 characters")
  .max(64, "Password must not exceed 64 characters")

const role = z
  .enum(["customer", "staff", "admin"], {
    errorMap: () => ({ message: "Role must be customer, staff, or admin" })
  })
  .default("customer")

const createUserSchema = z.object({
  name,
  email,
  phone,
  password,
  role: role.optional().default("customer")
}).strict()

const updateUserSchema = atLeastOneField(
  z.object({
    name,
    email,
    phone,
    password,
    role
  })
)

module.exports = { createUserSchema, updateUserSchema }
