# Savoria Restaurant Management System

A full-stack restaurant management platform featuring an Express/PostgreSQL RESTful API backend and a responsive Next.js (App Router, Tailwind CSS) customer frontend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture & Database Schema](#system-architecture--database-schema)
- [Backend Features & Security](#backend-features--security)
- [Frontend Features & UI Experience](#frontend-features--ui-experience)
- [Presentation & Demo Script](#presentation--demo-script)
- [Complete API Reference](#complete-api-reference)
- [Project Directory Structure](#project-directory-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Testing & Quality Verification](#testing--quality-verification)

---

## Overview

The **Savoria Restaurant Management System** delivers an end-to-end dining and ordering experience:
- **Backend (`/backend`):** A robust Node.js/Express REST API utilizing PostgreSQL via Sequelize ORM with migrations, seeders, transactional ordering, JWT authentication, and strict Zod validation.
- **Frontend (`/frontend`):** A modern Next.js 16 (App Router) web application styled with Tailwind CSS, delivering real-time search, category filtering, a slide-over cart drawer, and customer order tracking.

---

## Tech Stack

### Backend
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js 5
- **Database:** PostgreSQL (relational storage with foreign key constraints)
- **ORM:** Sequelize 6 & Sequelize CLI (migrations, seeders, associations)
- **Validation:** Zod 4 (schema enforcement on all incoming requests)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcrypt` password hashing
- **Security & Utilities:** `cors`, `express-rate-limit`, `dotenv`

### Frontend
- **Framework:** Next.js 16 (App Router, JavaScript `.jsx`)
- **Styling:** Tailwind CSS v4 (responsive warm neutral aesthetic with dark mode support)
- **Icons:** Lucide React
- **HTTP Client:** Axios (with request/response interceptors for Bearer auth)
- **State Management:** React Context API (`AuthContext`, `CartContext`)

---

## System Architecture & Database Schema

The database model is built on PostgreSQL with strict relational integrity and cascading rules.

### Entity-Relationship Diagram

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
| | `password` | VARCHAR | NOT NULL | Bcrypt hashed password (**never exposed in responses**) |
| | `role` | VARCHAR | NOT NULL, DEFAULT `'customer'` | Role: `'customer'`, `'staff'`, `'admin'` |
| **categories** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Category identifier |
| | `name` | VARCHAR | NOT NULL, UNIQUE | Category name |
| | `description` | TEXT | DEFAULT `''` | Category description |
| **menu_items** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Menu item identifier |
| | `name` | VARCHAR | NOT NULL | Item name |
| | `description` | TEXT | DEFAULT `''` | Item description |
| | `price` | DECIMAL(10, 2) | NOT NULL | Price in currency |
| | `categoryId` | INTEGER | NOT NULL, FK $\to$ `categories(id)` (`ON DELETE RESTRICT`) | Associated category |
| | `isAvailable` | BOOLEAN | NOT NULL, DEFAULT `true` | In-stock status |
| **orders** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Order identifier |
| | `userId` | INTEGER | NOT NULL, FK $\to$ `users(id)` (`ON DELETE CASCADE`) | Customer who placed order |
| | `status` | VARCHAR | NOT NULL, DEFAULT `'pending'` | Status: `'pending'`, `'preparing'`, `'ready'`, `'completed'`, `'cancelled'` |
| | `totalAmount` | DECIMAL(10, 2) | NOT NULL, DEFAULT `0.00` | Grand total sum of all order items |
| **order_items** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Order item identifier |
| | `orderId` | INTEGER | NOT NULL, FK $\to$ `orders(id)` (`ON DELETE CASCADE`) | Parent order reference |
| | `menuItemId` | INTEGER | NOT NULL, FK $\to$ `menu_items(id)` (`ON DELETE RESTRICT`) | Referencing menu item |
| | `quantity` | INTEGER | NOT NULL, DEFAULT `1` | Number of items |
| | `unitPrice` | DECIMAL(10, 2) | NOT NULL | Price per unit at purchase |
| | `subtotal` | DECIMAL(10, 2) | NOT NULL | `quantity × unitPrice` |

---

## Backend Features & Security

1. **Transactional Order Processing:**
   Orders and their associated line items are created atomically inside a managed Sequelize transaction (`sequelize.transaction()`). If any item is invalid or out of stock, the entire order rolls back cleanly.
2. **Password & Credential Protection:**
   - Passwords are encrypted with `bcrypt` (10 salt rounds).
   - Overridden `Users.prototype.toJSON` strips `password` from all serialized outputs.
   - Controllers explicitly exclude password fields (`attributes: { exclude: ['password'] }`).
3. **Data Validation:**
   Incoming payloads for every route are validated against strict Zod schemas before reaching business logic.
4. **Cascades & Protection:**
   Deleting a user or order cascades to related records, while deleting categories or menu items with existing relations is safely restricted.
5. **CORS & Rate Limiting:**
   Configured for cross-origin frontend requests with built-in API rate limiting.

---

## Frontend Features & UI Experience

1. **Dynamic Menu Browsing:**
   - All categories and dishes are fetched dynamically from the database (`GET /api/categories`, `GET /api/menu-items`). No hardcoded items.
   - Real-time instant search by dish name or description.
   - Category filter pills for rapid menu filtering.
2. **Interactive Cart Slide-Over:**
   - Quantity stepper (+/-), remove item, clear cart, and live order summary calculations.
   - Persisted across navigation within `CartContext`.
3. **Customer Profile Management (`/profile`):**
   - View account details (ID, name, email, phone, role, member date).
   - Edit personal contact info and update password.
   - Danger zone account deletion with confirmation.
4. **Staff Menu & Category Management (`/staff/menu`):**
   - Protected dashboard for staff and administrators.
   - Create, update, and delete categories with validation.
   - Create, update, and delete menu items (with category selector, price, and kitchen availability toggle).
5. **Orders & Receipt Tracking (`/orders` & `/orders/:id`):**
   - Authenticated-only orders view.
   - Live order status badges: `pending`, `preparing`, `ready`, `completed`, `cancelled`.
   - Itemized digital receipt modal and single-order view.
   - Customer-initiated order cancellation for pending orders.
   - Staff order tracking is strictly read-only (staff cannot update or delete orders).
6. **Harmonious Theme Design:**
   - Synchronized warm neutral tones (`bg-stone-100 dark:bg-stone-950`).
   - Cards, navbar, and cart backgrounds blend seamlessly with the page surface.

---

## Presentation & Demo Script

For evaluators, instructors, and live project presentations, an extensive 10-point presentation playbook is provided in [`script.md`](./script.md). It provides:
- **Speaking Notes:** Exact talking points explaining database architecture, ACID transactions, and security.
- **Live UI Demo Paths:** Step-by-step instructions for demonstrating staff menu management, customer cart checkout, and receipt tracking.
- **CLI Commands:** Terminal `psql` and cURL commands for demonstrating database relations and API responses.
- **End-to-End Diagram:** Mermaid sequence diagram tracing data flow from PostgreSQL $\to$ Sequelize $\to$ Express $\to$ Axios $\to$ React.

---

## Complete API Reference

All API routes are prefixed with `/api`.

### Authentication & Users
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer or staff account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/api/users` | Admin / Staff | List all users |
| `GET` | `/api/users/:id` | Authenticated | Get user profile by ID (Customer can only view own) |
| `PUT` | `/api/users/:id` | Authenticated | Update user info (Customer can only update own) |
| `DELETE`| `/api/users/:id` | Authenticated | Delete account (Customer can only delete own; Admin can delete any) |

### Categories
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all culinary categories |
| `GET` | `/api/categories/:id` | Public | Get single category with details |
| `POST` | `/api/categories` | Staff / Admin | Create new category (unique name required) |
| `PUT` | `/api/categories/:id` | Staff / Admin | Update category name or description |
| `DELETE`| `/api/categories/:id` | Staff / Admin | Delete category (restricted if dishes exist) |

### Menu Items
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/menu-items` | Public | List all menu items (filter by `?categoryId=`) |
| `GET` | `/api/menu-items/:id` | Public | Retrieve single menu item details |
| `POST` | `/api/menu-items` | Staff / Admin | Add new dish to menu |
| `PUT` | `/api/menu-items/:id` | Staff / Admin | Update dish details, price, or availability |
| `DELETE`| `/api/menu-items/:id` | Staff / Admin | Delete menu item (restricted if part of orders) |

### Orders
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Authenticated | Create order with items (atomic transaction) |
| `GET` | `/api/orders` | Authenticated | List orders (Customer: own orders; Staff/Admin: all orders) |
| `GET` | `/api/orders/:id` | Authenticated | Get single order with complete itemized receipt |
| `GET` | `/api/orders/:id/items` | Authenticated | Retrieve line items for a specific order |
| `PUT` | `/api/orders/:id` | Admin | Update order status (Staff cannot update) |
| `DELETE`| `/api/orders/:id` | Authenticated | Cancel pending order (Customer: own pending order; Staff cannot delete) |

---

## Project Directory Structure

```text
RestaurantAssignment/
├── script.md                          # Comprehensive 10-point presentation & demo script
├── backend/                           # Express & PostgreSQL Backend
│   ├── config/
│   │   └── config.js                  # Database credentials & dialect configuration
│   ├── migrations/                    # Database DDL migration scripts
│   │   ├── 20261004162223-create-users.js
│   │   ├── 20261004162705-create-categories.js
│   │   ├── 20261004163042-create-menu-items.js
│   │   ├── 20261004163100-create-orders.js
│   │   └── 20261004163310-create-order-items.js
│   ├── models/                        # Sequelize models & relational associations
│   │   ├── index.js                   # Connection initialization & loader
│   │   ├── users.js                   # Users model & password strip logic
│   │   ├── categories.js              # Categories model
│   │   ├── menu_items.js              # Menu_items model
│   │   ├── orders.js                  # Orders model
│   │   └── order_items.js             # Order_items model
│   ├── seeders/
│   │   └── 20261004170000-demo-restaurant-data.js
│   ├── src/
│   │   ├── controllers/               # Business logic controllers
│   │   ├── middleware/                # Auth, Zod validation, error handler, rate limit
│   │   ├── routes/                    # Express route declarations
│   │   ├── validators/                # Zod schemas for request validation
│   │   ├── app.js                     # Express app configuration & middleware
│   │   └── server.js                  # HTTP server bootstrap
│   ├── test/
│   │   └── api.test.js                # Integration test suite
│   ├── .env                           # Local environment configuration
│   ├── .env.example                   # Environment variable template
│   └── package.json
├── frontend/                          # Next.js 16 (App Router) Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css            # Synchronized background color tokens
│   │   │   ├── layout.jsx             # Root layout with Navbar, CartDrawer, and Footer
│   │   │   ├── page.jsx               # Menu page with real-time search & filters
│   │   │   ├── login/page.jsx         # Customer & Staff Sign In & Registration portal
│   │   │   ├── profile/page.jsx       # Customer profile management & account deletion
│   │   │   ├── staff/menu/page.jsx    # Staff category & menu CRUD dashboard
│   │   │   ├── orders/page.jsx        # Protected order history & receipt view
│   │   │   └── orders/[id]/page.jsx   # Detailed order tracking & status view
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Navigation header & cart badge
│   │   │   ├── MenuCard.jsx           # Dish card with quantity stepper & add to cart
│   │   │   ├── CartDrawer.jsx         # Slide-over cart and order checkout
│   │   │   ├── CategoryTabs.jsx       # Dynamic category filtering tabs
│   │   │   └── StatusBadge.jsx        # Order status badges with dark mode support
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth state & token persistence
│   │   │   └── CartContext.jsx        # Cart state & item management
│   │   └── lib/
│   │       └── api.js                 # Axios client with JWT interceptor
│   ├── public/                        # Static assets
│   ├── next.config.mjs
│   └── package.json
├── .gitignore                         # Repository gitignore
├── package.json                       # Root workspace orchestration scripts
└── README.md
```

---

## Installation & Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **PostgreSQL:** Running instance with a database created (e.g., `restaurant_db`)

### 1. Clone & Install Dependencies

From the workspace root, install backend and frontend dependencies:

```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment Variables

Create `backend/.env` based on `backend/.env.example`:

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

Optionally, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Migrations & Seed Database

Run migrations to create all database tables and seed initial data:

```bash
# From workspace root:
npm run db:migrate
npm run db:seed
```

Or inside `backend/`:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

---

## Running the Application

### Start Backend Server

```bash
# From root (dev mode with hot reload):
npm run dev:backend

# Or from backend/:
cd backend && npm run dev
```
The REST API will be available at `http://localhost:5000`.

### Start Frontend Application

In a separate terminal:

```bash
# From root:
npm run dev:frontend

# Or from frontend/:
cd frontend && npm run dev
```
The Next.js customer application will be available at `http://localhost:3000`.

---

## Testing & Quality Verification

### Run Backend Integration Tests
Executes the comprehensive PostgreSQL integration test suite:

```bash
npm run test:backend
```

### Lint Frontend
Checks for code quality and Next.js / ESLint rules:

```bash
npm run lint:frontend
```

### Build Frontend
Verifies production Turbopack compilation:

```bash
npm run build:frontend
```
