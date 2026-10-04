const { z } = require("zod")
const { atLeastOneField } = require("./common")

const createCategorySchema = z.object({
  name: z
    .string({
      required_error: "Category name is required",
      invalid_type_error: "Category name must be a string"
    })
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must not exceed 50 characters"),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .trim()
    .max(255, "Description must not exceed 255 characters")
    .optional()
}).strict()

const updateCategorySchema = atLeastOneField(createCategorySchema)

module.exports = { createCategorySchema, updateCategorySchema }
