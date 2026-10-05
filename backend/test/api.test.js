const assert = require("node:assert")
const http = require("node:http")
const path = require("node:path")
const jwt = require("jsonwebtoken")
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), quiet: true })

process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret123456"

const staffAuthHeaders = { Authorization: `Bearer ${jwt.sign({ id: 2, role: "staff" }, process.env.JWT_SECRET)}` }
const customerAuthHeaders = { Authorization: `Bearer ${jwt.sign({ id: 3, role: "customer" }, process.env.JWT_SECRET)}` }
const adminAuthHeaders = { Authorization: `Bearer ${jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET)}` }

const app = require("../src/app")
const { Users, Categories, Menu_items, Orders, Order_items, sequelize } = require("../models")

const server = http.createServer(app)

const makeRequest = ({ method = "GET", path, body = null, headers = {} }) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null
    const reqHeaders = { ...headers }
    if (payload) {
      reqHeaders["Content-Type"] = "application/json"
      reqHeaders["Content-Length"] = Buffer.byteLength(payload)
    }

    const addr = server.address()
    const options = {
      hostname: "127.0.0.1",
      port: addr.port,
      path,
      method,
      headers: reqHeaders
    }

    const req = http.request(options, (res) => {
      let rawData = ""
      res.on("data", (chunk) => {
        rawData += chunk
      })
      res.on("end", () => {
        try {
          const parsed = rawData ? JSON.parse(rawData) : null
          resolve({ status: res.statusCode, body: parsed })
        } catch {
          resolve({ status: res.statusCode, raw: rawData })
        }
      })
    })

    req.on("error", reject)
    if (payload) {
      req.write(payload)
    }
    req.end()
  })
}

const runTests = async () => {
  console.log("Starting Restaurant API Integration Tests with PostgreSQL...\n")

  await sequelize.authenticate()
  console.log("✓ PostgreSQL Database connection verified")

  const { Op } = require("sequelize")
  // Clean up any previous test remnants if present
  await Users.destroy({ where: { id: { [Op.gt]: 3 } } })
  await Categories.destroy({ where: { id: { [Op.gt]: 3 } } })
  await Menu_items.destroy({ where: { id: { [Op.gt]: 3 } } })
  await Orders.destroy({ where: { id: { [Op.gt]: 1 } } })

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const port = server.address().port
  console.log(`Test server running on port ${port}`)

  try {
    // 1. Root route
    console.log("Testing GET / ...")
    const rootRes = await makeRequest({ path: "/" })
    assert.strictEqual(rootRes.status, 200)
    assert.strictEqual(rootRes.body.success, true)

    // 2. Initial Database state check
    console.log("Checking Initial Database Seed in PostgreSQL...")
    const usersCount = await Users.count()
    const categoriesCount = await Categories.count()
    const menuItemsCount = await Menu_items.count()
    const ordersCount = await Orders.count()
    const orderItemsCount = await Order_items.count()

    assert(usersCount >= 3, "Seed users should exist in PostgreSQL")
    assert(categoriesCount >= 3, "Seed categories should exist in PostgreSQL")
    assert(menuItemsCount >= 3, "Seed menu_items should exist in PostgreSQL")
    assert(ordersCount >= 1, "Seed orders should exist in PostgreSQL")
    assert(orderItemsCount >= 3, "Seed order_items should exist in PostgreSQL")

    // Check seed Order #1 (Burger x 2, Pizza x 1, Coke x 2)
    const seedOrderRes = await makeRequest({ path: "/api/orders/1" })
    assert.strictEqual(seedOrderRes.status, 200)
    assert.strictEqual(seedOrderRes.body.order.items.length, 3)
    assert.strictEqual(seedOrderRes.body.order.totalAmount, 49.00)
    console.log("✓ Seed Order #1 verified in PostgreSQL with Burger x 2, Pizza x 1, Coke x 2")

    // 3. Category CRUD
    console.log("\nTesting Category CRUD...")
    // Customer cannot create category (403)
    const custCreateCatRes = await makeRequest({
      method: "POST",
      path: "/api/categories",
      body: { name: "Forbidden Desserts", description: "Sweet treats and pastries" },
      headers: customerAuthHeaders
    })
    assert.strictEqual(custCreateCatRes.status, 403)

    // Staff can create category (201)
    const createCatRes = await makeRequest({
      method: "POST",
      path: "/api/categories",
      body: { name: "Desserts", description: "Sweet treats and pastries" },
      headers: staffAuthHeaders
    })
    assert.strictEqual(createCatRes.status, 201)
    const newCatId = createCatRes.body.category.id
    assert.strictEqual(createCatRes.body.category.name, "Desserts")

    // Get all (Customer/Public can read)
    const getCatsRes = await makeRequest({ path: "/api/categories" })
    assert.strictEqual(getCatsRes.status, 200)
    assert(getCatsRes.body.categories.some((c) => c.id === newCatId))

    // Get one
    const getCatRes = await makeRequest({ path: `/api/categories/${newCatId}` })
    assert.strictEqual(getCatRes.status, 200)
    assert.strictEqual(getCatRes.body.category.name, "Desserts")

    // Customer cannot update category (403)
    const custUpdateCatRes = await makeRequest({
      method: "PUT",
      path: `/api/categories/${newCatId}`,
      body: { description: "Updated dessert description" },
      headers: customerAuthHeaders
    })
    assert.strictEqual(custUpdateCatRes.status, 403)

    // Staff can update category
    const updateCatRes = await makeRequest({
      method: "PUT",
      path: `/api/categories/${newCatId}`,
      body: { description: "Updated dessert description" },
      headers: staffAuthHeaders
    })
    assert.strictEqual(updateCatRes.status, 200)
    assert.strictEqual(updateCatRes.body.category.description, "Updated dessert description")

    // Customer cannot delete category (403)
    const custDeleteCatRes = await makeRequest({
      method: "DELETE",
      path: `/api/categories/${newCatId}`,
      headers: customerAuthHeaders
    })
    assert.strictEqual(custDeleteCatRes.status, 403)

    // Staff can delete unused category
    const deleteCatRes = await makeRequest({
      method: "DELETE",
      path: `/api/categories/${newCatId}`,
      headers: staffAuthHeaders
    })
    assert.strictEqual(deleteCatRes.status, 200)

    // Cannot delete category with menu items (Category 1 has Burgers)
    const deleteUsedCatRes = await makeRequest({
      method: "DELETE",
      path: "/api/categories/1",
      headers: staffAuthHeaders
    })
    assert.strictEqual(deleteUsedCatRes.status, 409)
    console.log("✓ Category CRUD, role permissions, and foreign key constraints verified")

    // 4. Menu Items CRUD
    console.log("\nTesting Menu Items CRUD...")
    // Customer cannot create menu item (403)
    const custCreateItemRes = await makeRequest({
      method: "POST",
      path: "/api/menu-items",
      body: {
        name: "Forbidden Taco",
        description: "Not allowed",
        price: 9.99,
        categoryId: 1
      },
      headers: customerAuthHeaders
    })
    assert.strictEqual(custCreateItemRes.status, 403)

    // Create menu item with non-existent categoryId should fail 404 (with staff auth)
    const invalidCatItemRes = await makeRequest({
      method: "POST",
      path: "/api/menu-items",
      body: {
        name: "Ghost Taco",
        description: "Not available",
        price: 9.99,
        categoryId: 9999
      },
      headers: staffAuthHeaders
    })
    assert.strictEqual(invalidCatItemRes.status, 404)

    // Create valid menu item as staff
    const createItemRes = await makeRequest({
      method: "POST",
      path: "/api/menu-items",
      body: {
        name: "Double Bacon Burger",
        description: "Juicy beef patty with crispy bacon and melted cheddar",
        price: 15.50,
        categoryId: 1
      },
      headers: staffAuthHeaders
    })
    assert.strictEqual(createItemRes.status, 201)
    const newItemId = createItemRes.body.menuItem.id

    // Get all (Customer/Public can read)
    const getItemsRes = await makeRequest({ path: "/api/menu-items" })
    assert.strictEqual(getItemsRes.status, 200)
    assert(getItemsRes.body.menuItems.some((i) => i.id === newItemId))

    // Filter by category
    const filterItemsRes = await makeRequest({ path: "/api/menu-items?categoryId=1" })
    assert.strictEqual(filterItemsRes.status, 200)
    assert(filterItemsRes.body.menuItems.every((i) => i.categoryId === 1))

    // Get one
    const getItemRes = await makeRequest({ path: `/api/menu-items/${newItemId}` })
    assert.strictEqual(getItemRes.status, 200)
    assert.strictEqual(getItemRes.body.menuItem.name, "Double Bacon Burger")

    // Customer cannot update menu item (403)
    const custUpdateItemRes = await makeRequest({
      method: "PUT",
      path: `/api/menu-items/${newItemId}`,
      body: { price: 99.99 },
      headers: customerAuthHeaders
    })
    assert.strictEqual(custUpdateItemRes.status, 403)

    // Staff can update menu item
    const updateItemRes = await makeRequest({
      method: "PUT",
      path: `/api/menu-items/${newItemId}`,
      body: { price: 16.50 },
      headers: staffAuthHeaders
    })
    assert.strictEqual(updateItemRes.status, 200)
    assert.strictEqual(updateItemRes.body.menuItem.price, 16.50)

    // Customer cannot delete menu item (403)
    const custDeleteItemRes = await makeRequest({
      method: "DELETE",
      path: `/api/menu-items/${newItemId}`,
      headers: customerAuthHeaders
    })
    assert.strictEqual(custDeleteItemRes.status, 403)

    // Staff can delete item not in any order
    const deleteItemRes = await makeRequest({
      method: "DELETE",
      path: `/api/menu-items/${newItemId}`,
      headers: staffAuthHeaders
    })
    assert.strictEqual(deleteItemRes.status, 200)

    // Deleting item in existing order (Item 1 is in Order 1) should return 409
    const deleteOrderedItemRes = await makeRequest({
      method: "DELETE",
      path: "/api/menu-items/1",
      headers: staffAuthHeaders
    })
    assert.strictEqual(deleteOrderedItemRes.status, 409)
    console.log("✓ Menu Item CRUD, role permissions, and foreign key constraints verified")

    // 5. User CRUD
    console.log("\nTesting User CRUD...")
    // Create user
    const createUserRes = await makeRequest({
      method: "POST",
      path: "/api/users",
      body: {
        name: "Alice Smith",
        email: "alice@restaurant.com",
        phone: "08012345678",
        password: "Password@123",
        role: "customer"
      }
    })
    assert.strictEqual(createUserRes.status, 201)
    const newUserId = createUserRes.body.user.id
    assert.strictEqual(createUserRes.body.user.password, undefined, "Password must NEVER be returned in response")
    const aliceAuthHeaders = { Authorization: `Bearer ${jwt.sign({ id: newUserId, role: "customer" }, process.env.JWT_SECRET)}` }

    // Duplicate email
    const duplicateUserRes = await makeRequest({
      method: "POST",
      path: "/api/users",
      body: {
        name: "Alice Clone",
        email: "alice@restaurant.com",
        phone: "08099999999",
        password: "Password@123"
      }
    })
    assert.strictEqual(duplicateUserRes.status, 409)

    // Get all users
    const getUsersRes = await makeRequest({ path: "/api/users", headers: adminAuthHeaders })
    assert.strictEqual(getUsersRes.status, 200)
    assert(getUsersRes.body.users.some((u) => u.id === newUserId))
    getUsersRes.body.users.forEach((u) => {
      assert.strictEqual(u.password, undefined, "User in list must not contain password")
    })

    // Another customer cannot view Alice's profile (403)
    const custOtherUserRes = await makeRequest({ path: `/api/users/${newUserId}`, headers: customerAuthHeaders })
    assert.strictEqual(custOtherUserRes.status, 403)

    // Alice can view her own details (200)
    const getUserRes = await makeRequest({ path: `/api/users/${newUserId}`, headers: aliceAuthHeaders })
    assert.strictEqual(getUserRes.status, 200)
    assert.strictEqual(getUserRes.body.user.name, "Alice Smith")
    assert.strictEqual(getUserRes.body.user.password, undefined, "Single user must not contain password")

    // Another customer cannot update Alice's profile (403)
    const custOtherUpdateRes = await makeRequest({
      method: "PUT",
      path: `/api/users/${newUserId}`,
      body: { name: "Hacked Alice" },
      headers: customerAuthHeaders
    })
    assert.strictEqual(custOtherUpdateRes.status, 403)

    // Alice can update her own profile (200)
    const updateUserRes = await makeRequest({
      method: "PUT",
      path: `/api/users/${newUserId}`,
      body: { name: "Alice Johnson" },
      headers: aliceAuthHeaders
    })
    assert.strictEqual(updateUserRes.status, 200)
    assert.strictEqual(updateUserRes.body.user.name, "Alice Johnson")
    assert.strictEqual(updateUserRes.body.user.password, undefined, "Updated user must not contain password")

    // Another customer cannot delete Alice's profile (403)
    const custOtherDeleteRes = await makeRequest({
      method: "DELETE",
      path: `/api/users/${newUserId}`,
      headers: customerAuthHeaders
    })
    assert.strictEqual(custOtherDeleteRes.status, 403)

    // Alice can delete her own profile (200)
    const deleteUserRes = await makeRequest({
      method: "DELETE",
      path: `/api/users/${newUserId}`,
      headers: aliceAuthHeaders
    })
    assert.strictEqual(deleteUserRes.status, 200)
    assert.strictEqual(deleteUserRes.body.user.name, "Alice Johnson")
    assert.strictEqual(deleteUserRes.body.user.password, undefined, "Deleted user must not contain password")
    console.log("✓ User CRUD, ownership permissions, and security verified successfully")

    // 6. Orders & Order Items
    console.log("\nTesting Orders and Order Items Integration with PostgreSQL...")
    // Create order with multiple items:
    // Burger (id 1, price 12.50) x 3 = 37.50
    // Coke (id 3, price 3.00) x 2 = 6.00
    // Expected totalAmount = 43.50
    const createOrderRes = await makeRequest({
      method: "POST",
      path: "/api/orders",
      body: {
        userId: 3,
        items: [
          { menuItemId: 1, quantity: 3 },
          { menuItemId: 3, quantity: 2 }
        ]
      },
      headers: customerAuthHeaders
    })
    assert.strictEqual(createOrderRes.status, 201)
    const newOrderId = createOrderRes.body.order.id
    assert.strictEqual(createOrderRes.body.order.totalAmount, 43.50)
    assert.strictEqual(createOrderRes.body.order.items.length, 2)
    assert.strictEqual(createOrderRes.body.order.status, "pending")

    // Verify order items in PostgreSQL directly
    const directItems = await Order_items.findAll({ where: { orderId: newOrderId }, order: [["id", "ASC"]] })
    assert.strictEqual(directItems.length, 2)
    assert.strictEqual(directItems[0].menuItemId, 1)
    assert.strictEqual(directItems[0].quantity, 3)
    assert.strictEqual(directItems[0].subtotal, 37.50)
    assert.strictEqual(directItems[1].menuItemId, 3)
    assert.strictEqual(directItems[1].quantity, 2)
    assert.strictEqual(directItems[1].subtotal, 6.00)

    // Staff can track all orders (200)
    const staffGetOrdersRes = await makeRequest({ path: "/api/orders", headers: staffAuthHeaders })
    assert.strictEqual(staffGetOrdersRes.status, 200)
    assert(staffGetOrdersRes.body.orders.some((o) => o.id === newOrderId))

    // Customer only sees their own orders
    const custOrdersRes = await makeRequest({ path: "/api/orders", headers: customerAuthHeaders })
    assert.strictEqual(custOrdersRes.status, 200)
    assert(custOrdersRes.body.orders.every((o) => o.userId === 3))

    // Get single order as customer
    const getOrderRes = await makeRequest({ path: `/api/orders/${newOrderId}`, headers: customerAuthHeaders })
    assert.strictEqual(getOrderRes.status, 200)
    assert.strictEqual(getOrderRes.body.order.id, newOrderId)
    assert.strictEqual(getOrderRes.body.order.items.length, 2)

    // Staff can view order details (tracking)
    const staffGetOrderRes = await makeRequest({ path: `/api/orders/${newOrderId}`, headers: staffAuthHeaders })
    assert.strictEqual(staffGetOrderRes.status, 200)
    assert.strictEqual(staffGetOrderRes.body.order.id, newOrderId)

    // Get order items subroute
    const getOrderItemsRes = await makeRequest({ path: `/api/orders/${newOrderId}/items`, headers: customerAuthHeaders })
    assert.strictEqual(getOrderItemsRes.status, 200)
    assert.strictEqual(getOrderItemsRes.body.items.length, 2)

    // Staff CANNOT update order status (403)
    const staffUpdateOrderRes = await makeRequest({
      method: "PUT",
      path: `/api/orders/${newOrderId}`,
      body: { status: "preparing" },
      headers: staffAuthHeaders
    })
    assert.strictEqual(staffUpdateOrderRes.status, 403)

    // Customer CANNOT update order status directly (403)
    const custUpdateOrderRes = await makeRequest({
      method: "PUT",
      path: `/api/orders/${newOrderId}`,
      body: { status: "preparing" },
      headers: customerAuthHeaders
    })
    assert.strictEqual(custUpdateOrderRes.status, 403)

    // Admin CAN update order status (200)
    const updateOrderRes = await makeRequest({
      method: "PUT",
      path: `/api/orders/${newOrderId}`,
      body: { status: "preparing" },
      headers: adminAuthHeaders
    })
    assert.strictEqual(updateOrderRes.status, 200)
    assert.strictEqual(updateOrderRes.body.order.status, "preparing")

    // Staff CANNOT delete order (403)
    const staffDeleteOrderRes = await makeRequest({
      method: "DELETE",
      path: `/api/orders/${newOrderId}`,
      headers: staffAuthHeaders
    })
    assert.strictEqual(staffDeleteOrderRes.status, 403)

    // Customer cannot cancel preparing order (400)
    const custCancelPreparingRes = await makeRequest({
      method: "DELETE",
      path: `/api/orders/${newOrderId}`,
      headers: customerAuthHeaders
    })
    assert.strictEqual(custCancelPreparingRes.status, 400)

    // Revert status to pending by admin so customer can cancel
    await Orders.update({ status: "pending" }, { where: { id: newOrderId } })

    // Customer CAN cancel own pending order (200)
    const deleteOrderRes = await makeRequest({
      method: "DELETE",
      path: `/api/orders/${newOrderId}`,
      headers: customerAuthHeaders
    })
    assert.strictEqual(deleteOrderRes.status, 200)
    const remainingItems = await Order_items.count({ where: { orderId: newOrderId } })
    assert.strictEqual(remainingItems, 0, "All order items must be removed via CASCADE in PostgreSQL")
    console.log("✓ Orders & Order Items tracking, cancellation, and staff restrictions verified in PostgreSQL")

    // 7. Auth: Register, Login, Me
    console.log("\nTesting Auth Routes...")
    const regRes = await makeRequest({
      method: "POST",
      path: "/api/auth/register",
      body: {
        name: "Bob Builder",
        email: "bob@restaurant.com",
        phone: "08087654321",
        password: "SecurePassword1!",
        role: "customer"
      }
    })
    assert.strictEqual(regRes.status, 201)
    assert(regRes.body.token, "Token should be returned on register")
    assert.strictEqual(regRes.body.user.password, undefined, "Registered user must not return password")

    const loginRes = await makeRequest({
      method: "POST",
      path: "/api/auth/login",
      body: {
        email: "bob@restaurant.com",
        password: "SecurePassword1!"
      }
    })
    assert.strictEqual(loginRes.status, 200)
    assert(loginRes.body.token, "Token should be returned on login")
    assert.strictEqual(loginRes.body.user.password, undefined, "Logged in user must not return password")
    const bobToken = loginRes.body.token

    const meRes = await makeRequest({
      path: "/api/auth/me",
      headers: { Authorization: `Bearer ${bobToken}` }
    })
    assert.strictEqual(meRes.status, 200)
    assert.strictEqual(meRes.body.user.email, "bob@restaurant.com")
    assert.strictEqual(meRes.body.user.password, undefined, "Current user profile must not return password")
    console.log("✓ Auth Register, Login, and Me verified with safe responses")

    // 8. 404 Route handling
    console.log("\nTesting 404 handler...")
    const notFoundRes = await makeRequest({ path: "/api/nonexistent" })
    assert.strictEqual(notFoundRes.status, 404)
    assert.strictEqual(notFoundRes.body.success, false)
    console.log("✓ 404 Not Found handling verified")

    console.log("\n==========================================")
    console.log("ALL POSTGRESQL TESTS PASSED SUCCESSFULLY!")
    console.log("==========================================")
  } finally {
    const { Op } = require("sequelize")
    try {
      await Users.destroy({ where: { id: { [Op.gt]: 3 } } })
      await Categories.destroy({ where: { id: { [Op.gt]: 3 } } })
      await Menu_items.destroy({ where: { id: { [Op.gt]: 3 } } })
      await Orders.destroy({ where: { id: { [Op.gt]: 1 } } })
    } catch {}
    await sequelize.close()
    server.close()
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})
