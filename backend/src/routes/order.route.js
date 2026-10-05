const express = require("express")
const router = express.Router()

const { optionalAuthenticate } = require("../middleware/authentication")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createOrderSchema, updateOrderSchema } = require("../validators/order")
const {
  getOrders,
  getOrder,
  getOrderItems,
  addOrder,
  updateOrder,
  deleteOrder
} = require("../controllers/orderController")

router.get("/", optionalAuthenticate, getOrders)
router.get("/:id", optionalAuthenticate, validate(idParamSchema, "params"), getOrder)
router.get("/:id/items", optionalAuthenticate, validate(idParamSchema, "params"), getOrderItems)
router.post("/", optionalAuthenticate, validate(createOrderSchema), addOrder)
router.put("/:id", optionalAuthenticate, validate(idParamSchema, "params"), validate(updateOrderSchema), updateOrder)
router.delete("/:id", optionalAuthenticate, validate(idParamSchema, "params"), deleteOrder)

module.exports = router
