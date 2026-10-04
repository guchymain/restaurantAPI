const express = require("express")
const router = express.Router()

const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createUserSchema, updateUserSchema } = require("../validators/user")
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser
} = require("../controllers/userController")

router.get("/", getUsers)
router.get("/:id", validate(idParamSchema, "params"), getUser)
router.post("/", validate(createUserSchema), addUser)
router.put("/:id", validate(idParamSchema, "params"), validate(updateUserSchema), updateUser)
router.delete("/:id", validate(idParamSchema, "params"), deleteUser)

module.exports = router
