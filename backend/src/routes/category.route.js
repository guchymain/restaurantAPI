const express = require("express")
const router = express.Router()

const { authenticate } = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createCategorySchema, updateCategorySchema } = require("../validators/category")
const {
  getCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController")

router.get("/", getCategories)
router.get("/:id", validate(idParamSchema, "params"), getCategory)
router.post("/", authenticate, authorize("staff", "admin"), validate(createCategorySchema), addCategory)
router.put("/:id", authenticate, authorize("staff", "admin"), validate(idParamSchema, "params"), validate(updateCategorySchema), updateCategory)
router.delete("/:id", authenticate, authorize("staff", "admin"), validate(idParamSchema, "params"), deleteCategory)

module.exports = router
