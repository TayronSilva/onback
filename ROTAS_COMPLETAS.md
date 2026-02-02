# 📋 Full API Route List

## Base URL
```
http://localhost:3000
```

---

## 🔑 AUTHENTICATION

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| POST | `/auth/login` | ❌ Public | - |

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 👤 USERS

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| POST | `/users` | ❌ Public | - |
| PATCH | `/users/me` | ✅ | - |

**POST /users Body:**
```json
{
  "cpf": "123.456.789-00",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**PATCH /users/me Body:**
```json
{
  "name": "Updated John Doe",
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

---

## 📦 PRODUCTS

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| GET | `/products` | ❌ Public | - |
| GET | `/products?search=term` | ❌ Public | - |
| GET | `/products/:id` | ❌ Public | - |
| POST | `/products` | ✅ | `product:create` |
| PATCH | `/products/:id` | ✅ | `product:update` |
| DELETE | `/products/:id` | ✅ | `product:delete` |

**POST /products** (multipart/form-data):
```
name: Premium Backpack
description: Durable backpack
price: 299.90
weight: 1500
width: 35
height: 45
length: 20
stocks: []
files: [image file]
```

**PATCH /products/:id Body:**
```json
{
  "name": "Updated Premium Backpack",
  "price": 349.90
}
```

---

## 📊 STOCK

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| GET | `/stocks` | ✅ | `stock:view` |
| POST | `/stocks` | ✅ | `stock:manage` |
| PATCH | `/stocks/:id` | ✅ | `stock:manage` |
| DELETE | `/stocks/:id` | ✅ | `stock:manage` |

**POST /stocks Body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "size": "M",
  "color": "Black",
  "quantity": 10
}
```

**PATCH /stocks/:id Body:**
```json
{
  "quantity": 15,
  "size": "L"
}
```

---

## 🛒 ORDERS

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| POST | `/orders` | ✅ | `order:manage` or `cart:manage` |
| GET | `/orders` | ✅ | `order:view` |
| GET | `/orders/me` | ✅ | `order:view` |
| GET | `/orders/:id` | ✅ | `order:view` |
| PATCH | `/orders/:id/cancel` | ✅ | `order:manage` |

**POST /orders Body:**
```json
{
  "items": [
    {
      "stockId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    }
  ],
  "paymentMethod": "pix"
}
```

**paymentMethod Options:**
- `"pix"` - 10% discount
- `"credit_card"` - Credit card
- `"debit_card"` - Debit card

---

## 📍 ADDRESSES

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| POST | `/address` | ✅ | `address:manage` |
| GET | `/address/me` | ✅ | `address:manage` |
| PATCH | `/address/:id/set-default` | ✅ | `address:manage` |
| DELETE | `/address/:id` | ✅ | `address:manage` |

**POST /address Body:**
```json
{
  "name": "John Doe",
  "zipCode": "26584-260",
  "phone": "(11)98765-4321",
  "address": "123 Flower Street",
  "additional": "Apt 202",
  "reference": "Near marketplace",
  "isDefault": true
}
```

---

## 💳 PAYMENTS

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| POST | `/payments/card` | ✅ | `order:manage` or `cart:manage` |

**POST /payments/card Body:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "mercado_pago_token",
  "installments": 3,
  "paymentMethodId": "credit_card"
}
```

---

## 🔐 PERMISSIONS (OWNER Only)

### Rules

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| GET | `/permissions/rules` | ✅ | `rule:view` |
| GET | `/permissions/rules/:id` | ✅ | `rule:view` |
| POST | `/permissions/rules` | ✅ | `rule:create` (OWNER) |
| PUT | `/permissions/rules/:id` | ✅ | `rule:update` (OWNER) |
| DELETE | `/permissions/rules/:id` | ✅ | `rule:delete` (OWNER) |

**POST /permissions/rules Body:**
```json
{
  "name": "New Permission",
  "slug": "resource:action",
  "description": "Permission description"
}
```

### Profiles

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| GET | `/permissions/profiles` | ✅ | `profile:view` |
| GET | `/permissions/profiles/:id` | ✅ | `profile:view` |
| POST | `/permissions/profiles` | ✅ | `profile:create` (OWNER) |
| PUT | `/permissions/profiles/:id` | ✅ | `profile:update` (OWNER) |
| DELETE | `/permissions/profiles/:id` | ✅ | `profile:delete` (OWNER) |

**POST /permissions/profiles Body:**
```json
{
  "name": "FULL_ADMIN",
  "description": "Profile with all permissions",
  "ruleIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
}
```

### User Profile Management

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| GET | `/permissions/users/:userId/profiles` | ✅ | `user:view-profiles` |
| POST | `/permissions/users/:userId/profiles/:profileId` | ✅ | `user:assign-profile` (OWNER) |
| DELETE | `/permissions/users/:userId/profiles/:profileId` | ✅ | `user:remove-profile` (OWNER) |

---

## 📊 DASHBOARD

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| GET | `/dashboard/statistics` | ✅ | `order:view` or `user:view` |
| GET | `/dashboard/sales-chart?days=30` | ✅ | `order:view` |

---

## 🔔 WEBHOOKS

| Method | Route | Authentication | Permission |
|--------|------|--------------|-----------|
| POST | `/webhooks/mercadopago` | ❌ Public | - |

**Body:**
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

---

## 📝 Required Headers

### For Authenticated Routes:
```
Authorization: Bearer {your_token_here}
Content-Type: application/json
```

### For File Uploads:
```
Authorization: Bearer {your_token_here}
Content-Type: multipart/form-data
```

---

## 🎯 Permission Summary by Route

### Public (no authentication):
- `POST /auth/login`
- `POST /users`
- `GET /products`
- `GET /products/:id`
- `POST /webhooks/mercadopago`

### Authenticated (login only):
- `PATCH /users/me`

### With Specific Permissions:
- **Products:** `product:create`, `product:update`, `product:delete`
- **Stock:** `stock:view`, `stock:manage`
- **Orders:** `order:view`, `order:manage`, `cart:manage`
- **Addresses:** `address:manage`
- **Payments:** `order:manage`, `cart:manage`
- **Permissions:** `rule:*`, `profile:*`, `user:*` (OWNER only)
- **Dashboard:** `order:view`, `user:view`

---

## 🚀 Useful Scripts

### Create profile with all permissions:
```bash
npm run create-admin-profile
```

### Assign profile to user:
```bash
npm run assign-profile {userId} {profileId}
```

### Run seed:
```bash
npx prisma db seed
```
