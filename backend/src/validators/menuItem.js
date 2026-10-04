const { z } = require("zod")
const { id, atLeastOneField } = require("./common")

const createMenuItemSchema = z.object({
  name: z
    .string({
      required_error: "Menu item name is required",
      invalid_type_error: "Menu item name must be a string"
    })
    .trim()
    .min(2, "Menu item name must be at least 2 characters")
    .max(100, "Menu item name must not exceed 100 characters"),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number"
    })
    .positive("Price must be a positive number"),
  categoryId: id("Category ID"),
  isAvailable: z.boolean({ invalid_type_error: "isAvailable must be a boolean" }).optional().default(true)
}).strict()

const updateMenuItemSchema = atLeastOneField(createMenuItemSchema)

module.exports = { createMenuItemSchema, updateMenuItemSchema }
