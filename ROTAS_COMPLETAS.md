# 📋 Lista Completa de Rotas da API

## Base URL
```
http://localhost:3000
```

---

## 🔑 AUTENTICAÇÃO

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| POST | `/auth/login` | ❌ Público | - |

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

---

## 👤 USUÁRIOS

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| POST | `/users` | ❌ Público | - |
| PATCH | `/users/me` | ✅ | - |

**POST /users Body:**
```json
{
  "cpf": "123.456.789-00",
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**PATCH /users/me Body:**
```json
{
  "name": "João Silva Atualizado",
  "email": "novoemail@example.com",
  "password": "novasenha123"
}
```

---

## 📦 PRODUTOS

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| GET | `/products` | ❌ Público | - |
| GET | `/products?search=termo` | ❌ Público | - |
| GET | `/products/:id` | ❌ Público | - |
| POST | `/products` | ✅ | `product:create` |
| PATCH | `/products/:id` | ✅ | `product:update` |
| DELETE | `/products/:id` | ✅ | `product:delete` |

**POST /products** (multipart/form-data):
```
name: Mochila Premium
description: Mochila resistente
price: 299.90
weight: 1500
width: 35
height: 45
length: 20
stocks: []
files: [arquivo de imagem]
```

**PATCH /products/:id Body:**
```json
{
  "name": "Mochila Premium Atualizada",
  "price": 349.90
}
```

---

## 📊 ESTOQUE

| Método | Rota | Autenticação | Permissão |
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
  "color": "Preto",
  "quantity": 10
}
```

**PATCH /stocks/:id Body:**
```json
{
  "quantity": 15,
  "size": "G"
}
```

---

## 🛒 PEDIDOS

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| POST | `/orders` | ✅ | `order:manage` ou `cart:manage` |
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

**Opções de paymentMethod:**
- `"pix"` - Desconto de 10%
- `"credit_card"` - Cartão de crédito
- `"debit_card"` - Cartão de débito

---

## 📍 ENDEREÇOS

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| POST | `/address` | ✅ | `address:manage` |
| GET | `/address/me` | ✅ | `address:manage` |
| PATCH | `/address/:id/set-default` | ✅ | `address:manage` |
| DELETE | `/address/:id` | ✅ | `address:manage` |

**POST /address Body:**
```json
{
  "name": "João Silva",
  "zipCode": "26584-260",
  "phone": "(11)98765-4321",
  "address": "Rua das Flores, 123",
  "additional": "Apto 202",
  "reference": "Próximo ao mercado",
  "isDefault": true
}
```

---

## 💳 PAGAMENTOS

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| POST | `/payments/card` | ✅ | `order:manage` ou `cart:manage` |

**POST /payments/card Body:**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "token_do_mercado_pago",
  "installments": 3,
  "paymentMethodId": "credit_card"
}
```

---

## 🔐 PERMISSÕES (Apenas OWNER)

### Regras

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| GET | `/permissions/rules` | ✅ | `rule:view` |
| GET | `/permissions/rules/:id` | ✅ | `rule:view` |
| POST | `/permissions/rules` | ✅ | `rule:create` (OWNER) |
| PUT | `/permissions/rules/:id` | ✅ | `rule:update` (OWNER) |
| DELETE | `/permissions/rules/:id` | ✅ | `rule:delete` (OWNER) |

**POST /permissions/rules Body:**
```json
{
  "name": "Nova Permissão",
  "slug": "resource:action",
  "description": "Descrição da permissão"
}
```

### Perfis

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| GET | `/permissions/profiles` | ✅ | `profile:view` |
| GET | `/permissions/profiles/:id` | ✅ | `profile:view` |
| POST | `/permissions/profiles` | ✅ | `profile:create` (OWNER) |
| PUT | `/permissions/profiles/:id` | ✅ | `profile:update` (OWNER) |
| DELETE | `/permissions/profiles/:id` | ✅ | `profile:delete` (OWNER) |

**POST /permissions/profiles Body:**
```json
{
  "name": "ADMIN_COMPLETO",
  "description": "Perfil com todas as permissões",
  "ruleIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
}
```

### Gerenciamento de Perfis de Usuário

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| GET | `/permissions/users/:userId/profiles` | ✅ | `user:view-profiles` |
| POST | `/permissions/users/:userId/profiles/:profileId` | ✅ | `user:assign-profile` (OWNER) |
| DELETE | `/permissions/users/:userId/profiles/:profileId` | ✅ | `user:remove-profile` (OWNER) |

---

## 📊 DASHBOARD

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| GET | `/dashboard/statistics` | ✅ | `order:view` ou `user:view` |
| GET | `/dashboard/sales-chart?days=30` | ✅ | `order:view` |

---

## 🔔 WEBHOOKS

| Método | Rota | Autenticação | Permissão |
|--------|------|--------------|-----------|
| POST | `/webhooks/mercadopago` | ❌ Público | - |

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

## 📝 Headers Necessários

### Para Rotas Autenticadas:
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
```

### Para Upload de Arquivos:
```
Authorization: Bearer {seu_token_aqui}
Content-Type: multipart/form-data
```

---

## 🎯 Resumo de Permissões por Rota

### Públicas (sem autenticação):
- `POST /auth/login`
- `POST /users`
- `GET /products`
- `GET /products/:id`
- `POST /webhooks/mercadopago`

### Autenticadas (apenas login):
- `PATCH /users/me`

### Com Permissões Específicas:
- **Produtos:** `product:create`, `product:update`, `product:delete`
- **Estoque:** `stock:view`, `stock:manage`
- **Pedidos:** `order:view`, `order:manage`, `cart:manage`
- **Endereços:** `address:manage`
- **Pagamentos:** `order:manage`, `cart:manage`
- **Permissões:** `rule:*`, `profile:*`, `user:*` (apenas OWNER)
- **Dashboard:** `order:view`, `user:view`

---

## 🚀 Scripts Úteis

### Criar perfil com todas as permissões:
```bash
npm run create-admin-profile
```

### Atribuir perfil a usuário:
```bash
npm run assign-profile {userId} {profileId}
```

### Executar seed:
```bash
npx prisma db seed
```
