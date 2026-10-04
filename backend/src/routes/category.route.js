const express = require("express")
const router = express.Router()

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
router.post("/", validate(createCategorySchema), addCategory)
router.put("/:id", validate(idParamSchema, "params"), validate(updateCategorySchema), updateCategory)
router.delete("/:id", validate(idParamSchema, "params"), deleteCategory)

module.exports = router
