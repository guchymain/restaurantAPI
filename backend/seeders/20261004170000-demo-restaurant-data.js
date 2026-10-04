'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    const now = new Date();

    // 1. Users
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'Admin Manager',
        email: 'admin@restaurant.com',
        phone: '07049665982',
        password: bcrypt.hashSync('Admin@123', saltRounds),
        role: 'admin',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Chef Gordon',
        email: 'staff@restaurant.com',
        phone: '08020000001',
        password: bcrypt.hashSync('Staff@123', saltRounds),
        role: 'staff',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'John Doe',
        email: 'customer@restaurant.com',
        phone: '08030000001',
        password: bcrypt.hashSync('Customer@123', saltRounds),
        role: 'customer',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 2. Categories
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Burgers',
        description: 'Juicy handcrafted burgers and sandwiches',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Pizzas',
        description: 'Oven-baked authentic pizzas',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Beverages',
        description: 'Refreshing cold drinks and soda',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 3. Menu Items
    await queryInterface.bulkInsert('menu_items', [
      {
        id: 1,
        name: 'Burger',
        description: 'Classic beef cheeseburger with lettuce, tomato, and secret sauce',
        price: 12.50,
        categoryId: 1,
        isAvailable: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Pizza',
        description: 'Wood-fired Margherita pizza with fresh mozzarella and basil',
        price: 18.00,
        categoryId: 2,
        isAvailable: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Coke',
        description: 'Chilled 330ml can of Coca-Cola',
        price: 3.00,
        categoryId: 3,
        isAvailable: true,
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 4. Orders
    await queryInterface.bulkInsert('orders', [
      {
        id: 1,
        userId: 3,
        status: 'pending',
        totalAmount: 49.00,
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 5. Order Items
    await queryInterface.bulkInsert('order_items', [
      {
        id: 1,
        orderId: 1,
        menuItemId: 1,
        quantity: 2,
        unitPrice: 12.50,
        subtotal: 25.00,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        orderId: 1,
        menuItemId: 2,
        quantity: 1,
        unitPrice: 18.00,
        subtotal: 18.00,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        orderId: 1,
        menuItemId: 3,
        quantity: 2,
        unitPrice: 3.00,
        subtotal: 6.00,
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // Reset sequences so auto-increment IDs start after 3
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
      await queryInterface.sequelize.query(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));`);
      await queryInterface.sequelize.query(`SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));`);
      await queryInterface.sequelize.query(`SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));`);
      await queryInterface.sequelize.query(`SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));`);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('menu_items', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
