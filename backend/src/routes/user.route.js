const express = require("express")
const router = express.Router()

const { optionalAuthenticate } = require("../middleware/authentication")
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

router.get("/", optionalAuthenticate, getUsers)
router.get("/:id", optionalAuthenticate, validate(idParamSchema, "params"), getUser)
router.post("/", validate(createUserSchema), addUser)
router.put("/:id", optionalAuthenticate, validate(idParamSchema, "params"), validate(updateUserSchema), updateUser)
router.delete("/:id", optionalAuthenticate, validate(idParamSchema, "params"), deleteUser)

module.exports = router
