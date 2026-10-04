const { z } = require("zod")
const { id, atLeastOneField } = require("./common")

const orderItemInputSchema = z.object({
  menuItemId: id("Menu item ID"),
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number"
    })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
}).strict()

const orderStatusEnum = z.enum(["pending", "preparing", "ready", "completed", "cancelled"], {
  errorMap: () => ({ message: "Status must be pending, preparing, ready, completed, or cancelled" })
})

const createOrderSchema = z.object({
  userId: id("User ID").optional(),
  items: z
    .array(orderItemInputSchema, {
      required_error: "Order items are required",
      invalid_type_error: "Items must be an array of order items"
    })
    .min(1, "Order must contain at least one menu item")
}).strict()

const updateOrderSchema = atLeastOneField(
  z.object({
    status: orderStatusEnum,
    items: z.array(orderItemInputSchema).min(1, "Order must contain at least one menu item")
  })
)

module.exports = { createOrderSchema, updateOrderSchema, orderItemInputSchema, orderStatusEnum }
