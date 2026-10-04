const { z } = require("zod")
const { email, name, phone } = require("./common")

const loginSchema = z.object({
  email,
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(1, "Password is required")
}).strict()

const registerSchema = z.object({
  name,
  email,
  phone,
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must not exceed 64 characters"),
  role: z.enum(["customer", "staff", "admin"]).default("customer")
}).strict()

module.exports = { loginSchema, registerSchema }
