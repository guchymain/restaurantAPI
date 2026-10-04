const { z } = require("zod")

const name = z
  .string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")

const email = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
  })
  .trim()
  .toLowerCase()
  .email("Invalid email")

const phone = z
  .string({
    required_error: "Phone number is required",
    invalid_type_error: "Phone number must be a string"
  })
  .trim()
  .regex(/^\d{11}$/, "Phone number must be 11 digits")

const id = (label) => z
  .number({
    required_error: `${label} is required`,
    invalid_type_error: `${label} must be a number`
  })
  .int(`${label} must be a whole number`)
  .positive(`${label} must be a positive number`)

// Validates :id in the URL
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, "ID must be a positive whole number")
})

// Update schemas must have at least one field
const atLeastOneField = (schema) => schema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Provide at least one field to update")

module.exports = { name, email, phone, id, idParamSchema, atLeastOneField }
