# 📋 Full Route Guide - Postman

## 🔐 Initial Configuration

### 1. Environment Variable in Postman
Create an environment variable named `base_url` with the value:
```
http://localhost:3000
```

### 2. Token Variable
Create a `token` variable that will be populated after login.

---

## 🔑 AUTHENTICATION

### POST /auth/login
**Public** - Authentication not required

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "permissions": ["product:view", "cart:manage", ...]
}
```

**⚠️ IMPORTANT:** Copy the `access_token` and save it in the `token` variable in Postman.

---

## 👤 USERS

### POST /users
**Public** - Create new user

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cpf": "123.456.789-00",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### PATCH /users/me
**Authenticated** - Update own profile

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "name": "Updated John Doe",
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

---

## 📦 PRODUCTS

### GET /products
**Public** - List all products

**Query Params (optional):**
```
?search=backpack
```

**Headers:**
```
(none required)
```

### GET /products/:id
**Public** - Get specific product

**Example:**
```
GET {{base_url}}/products/550e8400-e29b-41d4-a716-446655440000
```

### POST /products
**Authenticated + Permission:** `product:create`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: Premium Backpack
description: Durable laptop backpack
price: 299.90
weight: 1500
width: 35
height: 45
length: 20
stocks[0][productId]: (will be automatically filled)
stocks[0][size]: M
stocks[0][color]: Black
stocks[0][quantity]: 10
stocks[1][productId]: (will be automatically filled)
stocks[1][size]: L
stocks[1][color]: Blue
stocks[1][quantity]: 5
files: [select image file]
```

**⚠️ NOTE:** To create a product with stock, you first need to create the product without stock, then add stock separately via `/stocks`.

**Alternative (without initial stock):**
```json
{
  "name": "Premium Backpack",
  "description": "Durable backpack",
  "price": 299.90,
  "weight": 1500,
  "width": 35,
  "height": 45,
  "length": 20,
  "stocks": []
}
```

### PATCH /products/:id
**Authenticated + Permission:** `product:update`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Updated Premium Backpack",
  "price": 349.90,
  "description": "New description"
}
```

### DELETE /products/:id
**Authenticated + Permission:** `product:delete`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📊 STOCK

### GET /stocks
**Authenticated + Permission:** `stock:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### POST /stocks
**Authenticated + Permission:** `stock:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "size": "M",
  "color": "Black",
  "quantity": 10
}
```

### PATCH /stocks/:id
**Authenticated + Permission:** `stock:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "quantity": 15,
  "size": "L",
  "color": "Blue"
}
```

### DELETE /stocks/:id
**Authenticated + Permission:** `stock:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 🛒 ORDERS

### POST /orders
**Authenticated + Permission:** `order:manage` or `cart:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
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

**`paymentMethod` Options:**
- `"pix"` - 10% discount
- `"credit_card"` - Credit card
- `"debit_card"` - Debit card

### GET /orders
**Authenticated + Permission:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### GET /orders/me
**Authenticated + Permission:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### GET /orders/:id
**Authenticated + Permission:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### PATCH /orders/:id/cancel
**Authenticated + Permission:** `order:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📍 ADDRESSES

### POST /address
**Authenticated + Permission:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "John Doe",
  "zipCode": "26584-260",
  "phone": "(11)98765-4321",
  "address": "123 Flower Street",
  "additional": "Apt 202",
  "reference": "Near marketplace"
}
```

**⚠️ NOTE:** The first address registered will automatically be set as the default. To change the default address, use `PATCH /address/:id/set-default`.

### GET /address/me
**Authenticated + Permission:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

### PATCH /address/:id/set-default
**Authenticated + Permission:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

### DELETE /address/:id
**Authenticated + Permission:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 💳 PAYMENTS

### POST /payments/card
**Authenticated + Permission:** `order:manage` or `cart:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "mercado_pago_token",
  "installments": 3,
  "paymentMethodId": "credit_card"
}
```

**⚠️ NOTE:** The `token` must be generated on the frontend using the Mercado Pago SDK.

---

## 🔐 PERMISSIONS (OWNER Only)

### RULES

#### GET /permissions/rules
**Authenticated + Permission:** `rule:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### GET /permissions/rules/:id
**Authenticated + Permission:** `rule:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### POST /permissions/rules
**Authenticated + Permission:** `rule:create` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "New Permission",
  "slug": "resource:action",
  "description": "Permission description"
}
```

#### PUT /permissions/rules/:id
**Authenticated + Permission:** `rule:update` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Updated Permission",
  "slug": "resource:action",
  "description": "New description"
}
```

#### DELETE /permissions/rules/:id
**Authenticated + Permission:** `rule:delete` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
```

### PROFILES

#### GET /permissions/profiles
**Authenticated + Permission:** `profile:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### GET /permissions/profiles/:id
**Authenticated + Permission:** `profile:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### POST /permissions/profiles
**Authenticated + Permission:** `profile:create` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "TEST_ADMIN",
  "description": "Test profile with all permissions",
  "ruleIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
}
```

**⚠️ IMPORTANT:** To create a profile with all OWNER permissions, first list all rules with `GET /permissions/rules` and get all IDs.

#### PUT /permissions/profiles/:id
**Authenticated + Permission:** `profile:update` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "UPDATED_TEST_ADMIN",
  "description": "Updated description",
  "ruleIds": [1, 2, 3, 4, 5]
}
```

#### DELETE /permissions/profiles/:id
**Authenticated + Permission:** `profile:delete` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
```

### USER PROFILE MANAGEMENT

#### GET /permissions/users/:userId/profiles
**Authenticated + Permission:** `user:view-profiles`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### POST /permissions/users/:userId/profiles/:profileId
**Authenticated + Permission:** `user:assign-profile` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
```

**Example:**
```
POST {{base_url}}/permissions/users/1/profiles/2
```

#### DELETE /permissions/users/:userId/profiles/:profileId
**Authenticated + Permission:** `user:remove-profile` (OWNER only)

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📊 DASHBOARD

#### GET /dashboard/statistics
**Authenticated + Permission:** `order:view` or `user:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### GET /dashboard/sales-chart
**Authenticated + Permission:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (optional):**
```
?days=30
```

---

## 🔔 WEBHOOKS

### POST /webhooks/mercadopago
**Public** - Mercado Pago Webhook

**Headers:**
```
Content-Type: application/json
x-signature: (Mercado Pago signature)
```

**Body (JSON):**
```json
{
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

---

## 📝 HOW TO CREATE A PROFILE WITH ALL OWNER PERMISSIONS

### Step 1: Login as OWNER
```
POST {{base_url}}/auth/login
```

### Step 2: List all rules
```
GET {{base_url}}/permissions/rules
Authorization: Bearer {{token}}
```

Copy all `id` of the returned rules.

### Step 3: Create the profile with all rules
```
POST {{base_url}}/permissions/profiles
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "FULL_ADMIN",
  "description": "Profile with all system permissions",
  "ruleIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
}
```

**⚠️ IMPORTANT:** Replace the numbers with the real IDs of the rules you obtained in Step 2.

### Step 4: Assign the profile to a user
```
POST {{base_url}}/permissions/users/{userId}/profiles/{profileId}
Authorization: Bearer {{token}}
```

Replace `{userId}` with the user's ID and `{profileId}` with the created profile's ID.

---

## 🎯 RECOMMENDED TEST ORDER

1. **Create user** → `POST /users`
2. **Login** → `POST /auth/login` (save token)
3. **Create address** → `POST /address`
4. **List products** → `GET /products`
5. **Create product** → `POST /products` (permission required)
6. **Create stock** → `POST /stocks` (permission required)
7. **Create order** → `POST /orders`
8. **View orders** → `GET /orders/me`
9. **View dashboard** → `GET /dashboard/statistics` (permission required)

---

## ⚠️ IMPORTANT NOTES

1. **JWT Token:** After logging in, copy the `access_token` and use it in the `Authorization: Bearer {token}` header.
2. **Permissions:** Most routes need specific permissions. Use a user with an OWNER profile to test everything.
3. **Create OWNER profile:** The first user needs to have the OWNER profile assigned manually via database or endpoint.
4. **Products with images:** Use `multipart/form-data` and add images in the `files` field.
5. **Dynamic IDs:** The IDs returned in responses should be used in subsequent requests.
