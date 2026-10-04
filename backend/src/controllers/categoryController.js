const { Categories, Menu_items } = require("../../models")
const AppError = require("../utils/appError")
const { Op } = require("sequelize")

const checkCategoryNameIsFree = async (name, ignoreId) => {
  const whereClause = {
    name: { [Op.iLike]: name }
  }
  if (ignoreId) {
    whereClause.id = { [Op.ne]: ignoreId }
  }

  const existingCategory = await Categories.findOne({ where: whereClause })
  if (existingCategory) {
    throw new AppError("A category with this name already exists", 409)
  }
}

const getCategories = async (req, res, next) => {
  try {
    const categories = await Categories.findAll({
      order: [["id", "ASC"]]
    })

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    })
  } catch (error) {
    next(error)
  }
}

const getCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const category = await Categories.findByPk(id, {
      include: [
        {
          model: Menu_items,
          as: "menuItems"
        }
      ]
    })

    if (!category) {
      throw new AppError("Category not found", 404)
    }

    const plain = category.toJSON()

    res.status(200).json({
      success: true,
      category: {
        ...plain,
        menuItemsCount: plain.menuItems ? plain.menuItems.length : 0
      }
    })
  } catch (error) {
    next(error)
  }
}

const addCategory = async (req, res, next) => {
  try {
    const { name, description = "" } = req.body

    await checkCategoryNameIsFree(name)

    const newCategory = await Categories.create({
      name,
      description
    })

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory
    })
  } catch (error) {
    next(error)
  }
}

const updateCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const category = await Categories.findByPk(id)

    if (!category) {
      throw new AppError("Category not found", 404)
    }

    const { name, description } = req.body

    if (name !== undefined) {
      await checkCategoryNameIsFree(name, id)
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description

    await category.update(updateData)

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category
    })
  } catch (error) {
    next(error)
  }
}

const deleteCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const category = await Categories.findByPk(id)

    if (!category) {
      throw new AppError("Category not found", 404)
    }

    const hasMenuItems = await Menu_items.count({ where: { categoryId: id } })
    if (hasMenuItems > 0) {
      throw new AppError("Cannot delete category with associated menu items", 409)
    }

    const deletedCategory = category.toJSON()
    await category.destroy()

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      category: deletedCategory
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getCategories, getCategory, addCategory, updateCategory, deleteCategory }
