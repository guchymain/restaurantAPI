const { Menu_items, Categories, Order_items } = require("../../models")
const AppError = require("../utils/appError")
const { Op } = require("sequelize")

const checkCategoryExists = async (categoryId) => {
  const category = await Categories.findByPk(categoryId)
  if (!category) {
    throw new AppError("Category not found", 404)
  }
}

const checkItemNameInCatIsFree = async (name, categoryId, ignoreId) => {
  const whereClause = {
    categoryId,
    name: { [Op.iLike]: name }
  }
  if (ignoreId) {
    whereClause.id = { [Op.ne]: ignoreId }
  }

  const existingItem = await Menu_items.findOne({ where: whereClause })
  if (existingItem) {
    throw new AppError("A menu item with this name already exists in this category", 409)
  }
}

const formatMenuItem = (item) => {
  const plain = item.toJSON()
  return {
    ...plain,
    categoryName: plain.category ? plain.category.name : null
  }
}

const getMenuItems = async (req, res, next) => {
  try {
    const where = {}
    if (req.query.categoryId) {
      where.categoryId = Number(req.query.categoryId)
    }

    const items = await Menu_items.findAll({
      where,
      include: [
        {
          model: Categories,
          as: "category",
          attributes: ["id", "name"]
        }
      ],
      order: [["id", "ASC"]]
    })

    const formatted = items.map(formatMenuItem)

    res.status(200).json({
      success: true,
      count: formatted.length,
      menuItems: formatted
    })
  } catch (error) {
    next(error)
  }
}

const getMenuItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const item = await Menu_items.findByPk(id, {
      include: [
        {
          model: Categories,
          as: "category",
          attributes: ["id", "name"]
        }
      ]
    })

    if (!item) {
      throw new AppError("Menu item not found", 404)
    }

    res.status(200).json({
      success: true,
      menuItem: formatMenuItem(item)
    })
  } catch (error) {
    next(error)
  }
}

const addMenuItem = async (req, res, next) => {
  try {
    const { name, description = "", price, categoryId, isAvailable = true } = req.body

    await checkCategoryExists(categoryId)
    await checkItemNameInCatIsFree(name, categoryId)

    const newMenuItem = await Menu_items.create({
      name,
      description,
      price: Number(price),
      categoryId,
      isAvailable
    })

    const populated = await Menu_items.findByPk(newMenuItem.id, {
      include: [{ model: Categories, as: "category", attributes: ["id", "name"] }]
    })

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      menuItem: formatMenuItem(populated)
    })
  } catch (error) {
    next(error)
  }
}

const updateMenuItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const item = await Menu_items.findByPk(id)

    if (!item) {
      throw new AppError("Menu item not found", 404)
    }

    const { name, description, price, categoryId, isAvailable } = req.body

    const targetCategoryId = categoryId ?? item.categoryId
    if (categoryId !== undefined) {
      await checkCategoryExists(targetCategoryId)
    }

    if (name !== undefined || categoryId !== undefined) {
      await checkItemNameInCatIsFree(name ?? item.name, targetCategoryId, id)
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number(price)
    if (categoryId !== undefined) updateData.categoryId = targetCategoryId
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable

    await item.update(updateData)

    const populated = await Menu_items.findByPk(item.id, {
      include: [{ model: Categories, as: "category", attributes: ["id", "name"] }]
    })

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      menuItem: formatMenuItem(populated)
    })
  } catch (error) {
    next(error)
  }
}

const deleteMenuItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const item = await Menu_items.findByPk(id, {
      include: [{ model: Categories, as: "category", attributes: ["id", "name"] }]
    })

    if (!item) {
      throw new AppError("Menu item not found", 404)
    }

    const hasOrderReferences = await Order_items.count({ where: { menuItemId: id } })
    if (hasOrderReferences > 0) {
      throw new AppError("Cannot delete menu item that is referenced in existing orders", 409)
    }

    const formatted = formatMenuItem(item)
    await item.destroy()

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
      menuItem: formatted
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getMenuItems, getMenuItem, addMenuItem, updateMenuItem, deleteMenuItem }
