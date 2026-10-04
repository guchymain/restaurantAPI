const express = require("express")
const router = express.Router()

const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createMenuItemSchema, updateMenuItemSchema } = require("../validators/menuItem")
const {
  getMenuItems,
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require("../controllers/menuItemController")

router.get("/", getMenuItems)
router.get("/:id", validate(idParamSchema, "params"), getMenuItem)
router.post("/", validate(createMenuItemSchema), addMenuItem)
router.put("/:id", validate(idParamSchema, "params"), validate(updateMenuItemSchema), updateMenuItem)
router.delete("/:id", validate(idParamSchema, "params"), deleteMenuItem)

module.exports = router
