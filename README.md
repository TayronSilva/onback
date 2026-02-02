# 🛒 OnBack Backend

Complete e-commerce backend developed with NestJS, Prisma, and PostgreSQL. Robust authentication system, profile-based authorization, and hierarchical permissions.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [Permission System](#-permission-system)
- [API Endpoints](#-api-endpoints)
- [Example Users](#-example-users)
- [Documentation](#-documentation)

## ✨ Features

- 🔐 **JWT Authentication** - Secure authentication system
- 🛡️ **Profile-Based Authorization** - 11 hierarchical profiles with 26 permission rules
- 📦 **Product Management** - Full CRUD with images and stock management
- 🛒 **Order System** - Creation, management, and cancellation
- 💳 **Mercado Pago Integration** - Payments via card and webhooks
- 📍 **Addresses** - Management of multiple addresses per user
- 📊 **Dashboard** - Statistics and sales charts
- ✅ **Automatic Validation** - DTOs validated with class-validator
- 🧪 **Testing Ready** - Structure prepared for E2E tests

## 🚀 Technologies

- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT (passport-jwt)
- **Validation:** class-validator, class-transformer
- **Upload:** Multer (memory storage)
- **Payments:** Mercado Pago SDK
- **Storage:** Supabase (for images)

## 📦 Prerequisites

- Node.js >= 18.x
- npm or yarn
- PostgreSQL (or Neon)
- Supabase account (for image storage)
- Mercado Pago account (for payments)

## 🔧 Installation

```bash
# Clone the repository
git clone <https://github.com/TayronSilva/onback>
cd onback-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

## ⚙️ Configuration

Edit the `.env` file with your credentials:

```env
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# JWT
JWT_SECRET=your_jwt_secret_here

# Supabase (for image storage)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_key_here

# Mercado Pago (optional)
MERCADO_PAGO_ACCESS_TOKEN=your_token_here

# Port (optional, default: 3000)
PORT=3000
```

## 🏃 Running the Project

```bash
# Development (with watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with initial data
npx prisma db seed
```

The server will be running at `http://localhost:3000`

## 📁 Project Structure

```
onback-backend/
├── src/
│   ├── address/          # Address management
│   ├── auth/             # Authentication and JWT
│   ├── dashboard/        # Statistics and charts
│   ├── order/            # Order system
│   ├── payment/          # Mercado Pago integration
│   ├── permissions/      # Permission system
│   ├── product/          # Product CRUD
│   ├── stock/            # Stock management
│   ├── users/            # User management
│   ├── webhooks/         # Mercado Pago webhooks
│   └── main.ts           # Application bootstrap
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed with profiles and users
├── database/
│   └── prisma/           # Prisma service
├── scripts/
│   └── check-users.ts    # Script to verify users
├── POSTMAN_GUIDE.md      # Full route guide
├── POSTMAN_COLLECTION.json # Postman collection
└── ROTAS_COMPLETAS.md    # Quick route reference
```

## 🔐 Permission System

### Hierarchical Profiles

The system has **11 access profiles** organized hierarchically:

#### Main Profiles:
1. **OWNER** 👑 - Full access to the system (all 26 rules)
2. **ADMIN** 👔 - Almost everything, except managing profiles/rules
3. **MANAGER** 📊 - Manages products, stock, orders, and payments
4. **STAFF** 👷 - Views and edits products, manages stock
5. **SUPPORT** 🎧 - Views orders, users, and addresses
6. **VIEWER** 👁️ - Read-only access

#### Specific Profiles:
7. **CUSTOMER** - Default profile for new users
8. **MOD_STOCK** - Stock moderator
9. **ADMIN_PRODUCTS** - Product administrator
10. **DESIGNER_SITE** - Designer (views and edits products)
11. **ORDER_MANAGER** - Order manager

### Permission Rules (26 rules)

#### Products
- `product:view` - View products
- `product:create` - Create products
- `product:update` - Edit products
- `product:delete` - Delete products

#### Stock
- `stock:view` - View stock
- `stock:manage` - Manage stock

#### Orders
- `order:view` - View orders
- `order:manage` - Manage orders
- `cart:manage` - Manage cart

#### Users
- `user:view` - View users
- `user:manage` - Manage users
- `user:view-profiles` - View user profiles
- `user:assign-profile` - Assign profile (OWNER only)
- `user:remove-profile` - Remove profile (OWNER only)

#### Addresses
- `address:manage` - Manage addresses

#### Rules and Profiles (Meta-permissions)
- `rule:view`, `rule:create`, `rule:update`, `rule:delete`
- `profile:view`, `profile:create`, `profile:update`, `profile:delete`

#### Payments and Webhooks
- `payment:view`, `payment:manage`
- `webhook:manage`

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Login and obtain JWT token

### Users
- `POST /users` - Create new user (public)
- `PATCH /users/me` - Update own profile (authenticated)

### Products
- `GET /products` - List products (public)
- `GET /products/:id` - Get specific product (public)
- `POST /products` - Create product (`product:create`)
- `PATCH /products/:id` - Update product (`product:update`)
- `DELETE /products/:id` - Delete product (`product:delete`)

### Stock
- `GET /stocks` - List stock (`stock:view`)
- `POST /stocks` - Create stock (`stock:manage`)
- `PATCH /stocks/:id` - Update stock (`stock:manage`)
- `DELETE /stocks/:id` - Delete stock (`stock:manage`)

### Orders
- `POST /orders` - Create order (`order:manage` or `cart:manage`)
- `GET /orders` - List all orders (`order:view`)
- `GET /orders/me` - My orders (`order:view`)
- `GET /orders/:id` - Get specific order (`order:view`)
- `PATCH /orders/:id/cancel` - Cancel order (`order:manage`)

### Addresses
- `POST /address` - Create address (`address:manage`)
- `GET /address/me` - My addresses (`address:manage`)
- `PATCH /address/:id/set-default` - Set default address (`address:manage`)
- `DELETE /address/:id` - Delete address (`address:manage`)

### Payments
- `POST /payments/card` - Pay with card (`order:manage` or `cart:manage`)

### Dashboard
- `GET /dashboard/statistics` - Statistics (`order:view` or `user:view`)
- `GET /dashboard/sales-chart` - Sales chart (`order:view`)

### Permissions (OWNER only)
- `GET /permissions/rules` - List rules
- `POST /permissions/rules` - Create rule
- `PUT /permissions/rules/:id` - Update rule
- `DELETE /permissions/rules/:id` - Delete rule
- `GET /permissions/profiles` - List profiles
- `POST /permissions/profiles` - Create profile
- `PUT /permissions/profiles/:id` - Update profile
- `DELETE /permissions/profiles/:id` - Delete profile
- `POST /permissions/users/:userId/profiles/:profileId` - Assign profile
- `DELETE /permissions/users/:userId/profiles/:profileId` - Remove profile

### Webhooks
- `POST /webhooks/mercadopago` - Mercado Pago webhook (public)

📖 **Full Documentation:** See `POSTMAN_GUIDE.md` for detailed examples of all routes.

## 👤 Example Users

After running the seed (`npx prisma db seed`), the following users are created:

| Email | Profile | Password | Description |
|-------|--------|-------|-----------|
| `owner@onback.com` | OWNER | `senha123` | Full access to the system |
| `admin@onback.com` | ADMIN | `senha123` | Almost everything, except profiles/rules |
| `manager@onback.com` | MANAGER | `senha123` | Manages everyday operations |
| `staff@onback.com` | STAFF | `senha123` | Basic product operations |
| `support@onback.com` | SUPPORT | `senha123` | Customer support |
| `viewer@onback.com` | VIEWER | `senha123` | View only |

## 📚 Documentation

- **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** - Full guide with examples of all routes
- **[POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)** - Collection ready to import into Postman
- **[ROTAS_COMPLETAS.md](./ROTAS_COMPLETAS.md)** - Quick reference for all routes

## 🗄️ Database

### Main Models

- **User** - System users
- **AccessProfile** - Access profiles
- **Rule** - Permission rules
- **UserProfile** - User-profile relation
- **Product** - Products
- **Stock** - Product stock
- **ProductImages** - Product images
- **Order** - Orders
- **OrderItem** - Order items
- **Address** - User addresses

### Seed

The seed (`prisma/seed.ts`) automatically creates:
- ✅ 26 permission rules
- ✅ 11 access profiles
- ✅ 6 example users

Run: `npx prisma db seed`

## 🔒 Security

- Passwords are hashed with bcrypt (salt rounds: 6)
- JWT tokens expire in 1 hour
- Automatic DTO validation with `ValidationPipe`
- Guards protect sensitive routes
- CORS enabled for development

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📝 Available Scripts

```bash
npm run start:dev      # Development with watch
npm run build          # Build for production
npm run start:prod     # Run production
npm run lint           # Linter
npm run format         # Format code
npm run test           # Unit tests
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and has no public license.

## 👨‍💻 Author

Developed for the OnBack project.

---

**🚀 Ready to start?** Run `npm install`, configure `.env`, and run `npm run start:dev`!
