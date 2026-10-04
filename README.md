# Restaurant Management System API

A RESTful API for managing users, categories, menu items, orders, and order items for a restaurant.

Built with **Node.js**, **Express**, **PostgreSQL**, **Sequelize ORM**, **JWT**, **bcrypt**, and **Zod**.

---

## Database & Architecture

The application uses **PostgreSQL** as its persistent relational database, managed via **Sequelize ORM** and **Sequelize CLI**.

### Database Schema & Relational Model

```text
               +------------------+
               |      users       |
               +------------------+
               | id (PK)          |
               | name (NOT NULL)  |
               | email (UNIQUE)   |
               | phone (NOT NULL) |
               | password (HASH)  |
               | role (DEFAULT)   |
               +--------+---------+
                        | 1
                        |
                        | N (ON DELETE CASCADE)
               +--------v---------+
               |      orders      |
               +------------------+
               | id (PK)          |
               | userId (FK)      |
               | status (DEFAULT) |
               | totalAmount      |
               +--------+---------+
                        | 1
                        |
                        | N (ON DELETE CASCADE)
+------------------+   +v-----------------+
|    categories    |   |   order_items    |
+------------------+   +------------------+
| id (PK)          |   | id (PK)          |
| name (UNIQUE)    |   | orderId (FK)     |
| description      |   | menuItemId (FK)  |
+--------+---------+   | quantity (NOT N) |
         | 1           | unitPrice (DEC)  |
         |             | subtotal (DEC)   |
         | N (RESTRICT)+--------+---------+
+--------v---------+            |
|    menu_items    |            |
+------------------+            |
| id (PK)          |            |
| name (NOT NULL)  |            |
| price (DECIMAL)  |            |
| categoryId (FK)  |            |
| isAvailable (DEF)|<-----------+ (ON DELETE RESTRICT)
+------------------+
```

### Table Specifications & Constraints

| Table | Column | Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| **users** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| | `name` | VARCHAR | NOT NULL | User's full name |
| | `email` | VARCHAR | NOT NULL, UNIQUE | User's email address |
| | `phone` | VARCHAR | NOT NULL | User's phone number |
| | `password` | VARCHAR | NOT NULL | Bcrypt hashed password (**never returned in responses**) |
| | `role` | VARCHAR | NOT NULL, DEFAULT `'customer'` | Role: `'customer'`, `'staff'`, `'admin'` |
| **categories** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Category identifier |
| | `name` | VARCHAR | NOT NULL, UNIQUE | Category name |
| | `description` | TEXT | DEFAULT `''` | Category description |
| **menu_items** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Menu item identifier |
| | `name` | VARCHAR | NOT NULL | Item name |
| | `description` | TEXT | DEFAULT `''` | Item description |
| | `price` | DECIMAL(10, 2) | NOT NULL | Price in currency |
| | `categoryId` | INTEGER | NOT NULL, FK -> `categories(id)` (`ON DELETE RESTRICT`) | Associated category |
| | `isAvailable` | BOOLEAN | NOT NULL, DEFAULT `true` | In-stock status |
| **orders** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Order identifier |
| | `userId` | INTEGER | NOT NULL, FK -> `users(id)` (`ON DELETE CASCADE`) | Customer who placed order |
| | `status` | VARCHAR | NOT NULL, DEFAULT `'pending'` | Status: `'pending'`, `'preparing'`, `'ready'`, `'completed'`, `'cancelled'` |
| | `totalAmount` | DECIMAL(10, 2) | NOT NULL, DEFAULT `0.00` | Grand total sum of all order items |
| **order_items** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Order item identifier |
| | `orderId` | INTEGER | NOT NULL, FK -> `orders(id)` (`ON DELETE CASCADE`) | Parent order reference |
| | `menuItemId` | INTEGER | NOT NULL, FK -> `menu_items(id)` (`ON DELETE RESTRICT`) | Referencing menu item |
| | `quantity` | INTEGER | NOT NULL, DEFAULT `1` | Number of items |
| | `unitPrice` | DECIMAL(10, 2) | NOT NULL | Price per unit at purchase |
| | `subtotal` | DECIMAL(10, 2) | NOT NULL | `quantity × unitPrice` |

---

## Order Items Structure

An order contains multiple menu items properly connected via foreign keys:

```text
Order #1
 ├── Burger × 2  ($12.50 ea -> $25.00)
 ├── Pizza × 1   ($18.00 ea -> $18.00)
 └── Coke × 2    ($3.00 ea  -> $6.00)
Total: $49.00
```

When an order is created (`POST /api/orders`), the API:
1. Validates user and menu item existence.
2. Performs all calculations within a **managed database transaction** (`sequelize.transaction()`).
3. Inserts the order and bulk-inserts all `order_items`.
4. Returns the fully populated order with nested items.

---

## Project Structure

```text
RestaurantAssignment/
├── backend/
│   ├── config/
│   │   └── config.js              # Database configuration (development, test, production)
│   ├── migrations/
│   │   ├── 20261004162223-create-users.js
│   │   ├── 20261004162705-create-categories.js
│   │   ├── 20261004163042-create-menu-items.js
│   │   ├── 20261004163100-create-orders.js
│   │   └── 20261004163310-create-order-items.js
│   ├── models/
│   │   ├── index.js               # Sequelize initialization & model loader
│   │   ├── users.js               # Users model & associations (safe toJSON)
│   │   ├── categories.js          # Categories model & associations
│   │   ├── menu_items.js          # Menu_items model & associations
│   │   ├── orders.js              # Orders model & associations
│   │   └── order_items.js         # Order_items model & associations
│   ├── seeders/
│   │   └── 20261004170000-demo-restaurant-data.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── menuItemController.js
│   │   │   ├── orderController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── category.route.js
│   │   │   ├── menuItem.route.js
│   │   │   ├── order.route.js
│   │   │   └── user.route.js
│   │   ├── middleware/
│   │   │   ├── authentication.js
│   │   │   ├── authorization.js
│   │   │   ├── error.js
│   │   │   ├── logger.js
│   │   │   ├── notFound.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.js
│   │   ├── validators/
│   │   │   ├── auth.js
│   │   │   ├── category.js
│   │   │   ├── common.js
│   │   │   ├── menuItem.js
│   │   │   ├── order.js
│   │   │   └── user.js
│   │   ├── utils/
│   │   │   ├── appError.js
│   │   │   └── helpers.js
│   │   ├── app.js                 # Express app setup with CORS enabled
│   │   └── server.js
│   ├── test/
│   │   └── api.test.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/                      # (Future React / Next.js application)
├── .env.example                   # Shared / template env
├── .gitignore                     # Root gitignore
├── package.json                   # Root workspace orchestration scripts
└── README.md
```

---

## Security: Password Protection

> [!IMPORTANT]
> **Passwords are NEVER returned in API responses**:
> - Password hashes are stored using **bcrypt** with configurable salt rounds.
> - The `Users` model defines an overridden `toJSON()` method that automatically strips the `password` field from serialized objects.
> - Controller queries explicitly exclude passwords (`attributes: { exclude: ['password'] }`).

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Users** | | |
| `POST` | `/api/users` | Create user (password hashed, never returned) |
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users/:id` | Get single user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE`| `/api/users/:id` | Delete user (cascades orders) |
| **Categories** | | |
| `POST` | `/api/categories` | Create category (unique name) |
| `GET` | `/api/categories` | Get all categories |
| `GET` | `/api/categories/:id` | Get category with menu items |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE`| `/api/categories/:id` | Delete category (protected if items exist) |
| **Menu Items** | | |
| `POST` | `/api/menu-items` | Create menu item (must belong to category) |
| `GET` | `/api/menu-items` | Get menu items (optional `?categoryId=`) |
| `GET` | `/api/menu-items/:id` | Get single menu item |
| `PUT` | `/api/menu-items/:id` | Update menu item |
| `DELETE`| `/api/menu-items/:id` | Delete menu item (protected if in orders) |
| **Orders & Order Items** | | |
| `POST` | `/api/orders` | Create order with items (transactional) |
| `GET` | `/api/orders` | Get orders with populated items & menu details |
| `GET` | `/api/orders/:id` | Get single order with complete item tree |
| `GET` | `/api/orders/:id/items` | Get only items of an order |
| `PUT` | `/api/orders/:id` | Update order status or items |
| `DELETE`| `/api/orders/:id` | Delete order (cascades order_items) |
| **Authentication** | | |
| `POST` | `/api/auth/register` | Register new user and receive JWT token |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Get authenticated user profile |

---

## Setup & Running

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and configure your PostgreSQL database credentials:

```env
PORT=
JWT_SECRET=
JWT_EXPIRES_IN=
SALT_ROUNDS=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_HOST=
DB_PORT=
DB_DIALECT=
```

### 2. Run Database Migrations
Run the migrations to create all tables with foreign keys and constraints:

From the workspace root:
```bash
npm run db:migrate
```
Or directly inside `backend/`:
```bash
cd backend
npm run db:migrate
```

### 3. Seed Database
Seed initial users, categories, menu items, and Order #1:

From the workspace root:
```bash
npm run db:seed
```
Or directly inside `backend/`:
```bash
cd backend
npm run db:seed
```

### 4. Start the Application
From the workspace root:
```bash
# Development mode with auto-reload
npm run dev:backend

# Production / Standard mode
npm run start:backend
```

Or directly inside `backend/`:
```bash
cd backend
npm run dev      # or npm start
```

### 5. Run Automated Tests
From the workspace root:
```bash
npm run test:backend
```

Or directly inside `backend/`:
```bash
cd backend
npm test
```

### 6. Frontend Development (Next.js)
The frontend application lives in [`frontend/`](file:///home/mann/Desktop/New%20Folder/Backend/wk3/RestaurantAssignment/frontend).

From the workspace root:
```bash
# Start Next.js development server (http://localhost:3000)
npm run dev:frontend

# Build frontend for production
npm run build:frontend

# Start production server
npm run start:frontend

# Lint frontend
npm run lint:frontend
```

Or directly inside `frontend/`:
```bash
cd frontend
npm run dev
```

### 7. Connecting Frontend & Backend
- Backend REST API runs on `http://localhost:5000` with **CORS enabled**.
- Next.js frontend runs on `http://localhost:3000`.
- API Base URL: `http://localhost:5000/api`
- Authentication: Pass JWT in header `Authorization: Bearer <token>`

