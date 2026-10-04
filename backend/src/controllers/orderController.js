const { Orders, Order_items, Menu_items, Users, sequelize } = require("../../models")
const AppError = require("../utils/appError")

const formatOrder = (order) => {
  const plain = order.toJSON()

  const items = (plain.items || []).map((oi) => ({
    id: oi.id,
    orderId: oi.orderId,
    menuItemId: oi.menuItemId,
    name: oi.menuItem ? oi.menuItem.name : "Unknown Item",
    price: oi.unitPrice,
    quantity: oi.quantity,
    subtotal: oi.subtotal,
    createdAt: oi.createdAt
  }))

  return {
    id: plain.id,
    userId: plain.userId,
    user: plain.user || null,
    status: plain.status,
    totalAmount: plain.totalAmount,
    items,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  }
}

const getOrderQueryIncludes = () => [
  {
    model: Users,
    as: "user",
    attributes: ["id", "name", "email", "phone", "role"]
  },
  {
    model: Order_items,
    as: "items",
    include: [
      {
        model: Menu_items,
        as: "menuItem",
        attributes: ["id", "name", "price"]
      }
    ]
  }
]

const getOrders = async (req, res, next) => {
  try {
    const where = {}

    // If customer is logged in, show only their orders
    if (req.user && req.user.role === "customer") {
      where.userId = req.user.id
    } else if (req.query.userId) {
      where.userId = Number(req.query.userId)
    }

    if (req.query.status) {
      where.status = req.query.status
    }

    const orders = await Orders.findAll({
      where,
      include: getOrderQueryIncludes(),
      order: [["id", "ASC"]]
    })

    const formatted = orders.map(formatOrder)

    res.status(200).json({
      success: true,
      count: formatted.length,
      orders: formatted
    })
  } catch (error) {
    next(error)
  }
}

const getOrder = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const order = await Orders.findByPk(id, {
      include: getOrderQueryIncludes()
    })

    if (!order) {
      throw new AppError("Order not found", 404)
    }

    // If customer is logged in, verify ownership
    if (req.user && req.user.role === "customer" && order.userId !== req.user.id) {
      throw new AppError("Forbidden. You can only view your own orders", 403)
    }

    res.status(200).json({
      success: true,
      order: formatOrder(order)
    })
  } catch (error) {
    next(error)
  }
}

const getOrderItems = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const order = await Orders.findByPk(id)
    if (!order) {
      throw new AppError("Order not found", 404)
    }

    const items = await Order_items.findAll({
      where: { orderId: id },
      include: [
        {
          model: Menu_items,
          as: "menuItem",
          attributes: ["id", "name", "price"]
        }
      ],
      order: [["id", "ASC"]]
    })

    const formattedItems = items.map((oi) => ({
      id: oi.id,
      orderId: oi.orderId,
      menuItemId: oi.menuItemId,
      name: oi.menuItem ? oi.menuItem.name : "Unknown Item",
      price: oi.unitPrice,
      quantity: oi.quantity,
      subtotal: oi.subtotal
    }))

    res.status(200).json({
      success: true,
      orderId: id,
      count: formattedItems.length,
      items: formattedItems
    })
  } catch (error) {
    next(error)
  }
}

const addOrder = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const targetUserId = req.body.userId || (req.user ? req.user.id : null)

    if (!targetUserId) {
      throw new AppError("User ID is required to place an order", 400)
    }

    const user = await Users.findByPk(targetUserId, { transaction: t })
    if (!user) {
      throw new AppError("User not found", 404)
    }

    const { items } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("Order must contain at least one item", 400)
    }

    const preparedItems = []
    let totalAmount = 0

    for (const item of items) {
      const menuItem = await Menu_items.findByPk(item.menuItemId, { transaction: t })

      if (!menuItem) {
        throw new AppError(`Menu item with ID ${item.menuItemId} not found`, 404)
      }

      if (!menuItem.isAvailable) {
        throw new AppError(`Menu item '${menuItem.name}' is currently unavailable`, 400)
      }

      const unitPrice = menuItem.price
      const subtotal = Number((unitPrice * item.quantity).toFixed(2))
      totalAmount += subtotal

      preparedItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
        subtotal
      })
    }

    const newOrder = await Orders.create(
      {
        userId: targetUserId,
        status: "pending",
        totalAmount: Number(totalAmount.toFixed(2))
      },
      { transaction: t }
    )

    const itemsToCreate = preparedItems.map((pi) => ({
      ...pi,
      orderId: newOrder.id
    }))

    await Order_items.bulkCreate(itemsToCreate, { transaction: t })

    await t.commit()

    const populated = await Orders.findByPk(newOrder.id, {
      include: getOrderQueryIncludes()
    })

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: formatOrder(populated)
    })
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

const updateOrder = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
    const id = Number(req.params.id)

    const order = await Orders.findByPk(id, { transaction: t })

    if (!order) {
      throw new AppError("Order not found", 404)
    }

    const { status, items } = req.body

    if (status !== undefined) {
      order.status = status
    }

    if (items !== undefined && Array.isArray(items) && items.length > 0) {
      const preparedItems = []
      let newTotalAmount = 0

      for (const item of items) {
        const menuItem = await Menu_items.findByPk(item.menuItemId, { transaction: t })

        if (!menuItem) {
          throw new AppError(`Menu item with ID ${item.menuItemId} not found`, 404)
        }

        const unitPrice = menuItem.price
        const subtotal = Number((unitPrice * item.quantity).toFixed(2))
        newTotalAmount += subtotal

        preparedItems.push({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice,
          subtotal
        })
      }

      await Order_items.destroy({ where: { orderId: id }, transaction: t })
      await Order_items.bulkCreate(preparedItems, { transaction: t })

      order.totalAmount = Number(newTotalAmount.toFixed(2))
    }

    await order.save({ transaction: t })
    await t.commit()

    const populated = await Orders.findByPk(order.id, {
      include: getOrderQueryIncludes()
    })

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: formatOrder(populated)
    })
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

const deleteOrder = async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const order = await Orders.findByPk(id)

    if (!order) {
      throw new AppError("Order not found", 404)
    }

    const orderData = order.toJSON()
    await order.destroy()

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      order: orderData
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getOrders, getOrder, getOrderItems, addOrder, updateOrder, deleteOrder }
