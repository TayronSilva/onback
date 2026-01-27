# 📋 Guia Completo de Rotas - Postman

## 🔐 Configuração Inicial

### 1. Variável de Ambiente no Postman
Crie uma variável de ambiente chamada `base_url` com o valor:
```
http://localhost:3000
```

### 2. Variável para Token
Crie uma variável `token` que será preenchida após o login.

---

## 🔑 AUTENTICAÇÃO

### POST /auth/login
**Público** - Não precisa de autenticação

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "name": "João Silva",
  "email": "usuario@example.com",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "permissions": ["product:view", "cart:manage", ...]
}
```

**⚠️ IMPORTANTE:** Copie o `access_token` e salve na variável `token` do Postman.

---

## 👤 USUÁRIOS

### POST /users
**Público** - Criar novo usuário

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cpf": "123.456.789-00",
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

### PATCH /users/me
**Autenticado** - Atualizar próprio perfil

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (JSON):**
```json
{
  "name": "João Silva Atualizado",
  "email": "novoemail@example.com",
  "password": "novasenha123"
}
```

---

## 📦 PRODUTOS

### GET /products
**Público** - Listar todos os produtos

**Query Params (opcional):**
```
?search=mochila
```

**Headers:**
```
(nenhum necessário)
```

### GET /products/:id
**Público** - Obter produto específico

**Exemplo:**
```
GET {{base_url}}/products/550e8400-e29b-41d4-a716-446655440000
```

### POST /products
**Autenticado + Permissão:** `product:create`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: Mochila Premium
description: Mochila resistente para notebook
price: 299.90
weight: 1500
width: 35
height: 45
length: 20
stocks[0][productId]: (será preenchido automaticamente)
stocks[0][size]: M
stocks[0][color]: Preto
stocks[0][quantity]: 10
stocks[1][productId]: (será preenchido automaticamente)
stocks[1][size]: G
stocks[1][color]: Azul
stocks[1][quantity]: 5
files: [selecionar arquivo de imagem]
```

**⚠️ NOTA:** Para criar produto com estoque, você precisa primeiro criar o produto sem estoque, depois adicionar o estoque separadamente via `/stocks`.

**Alternativa (sem estoque inicial):**
```json
{
  "name": "Mochila Premium",
  "description": "Mochila resistente",
  "price": 299.90,
  "weight": 1500,
  "width": 35,
  "height": 45,
  "length": 20,
  "stocks": []
}
```

### PATCH /products/:id
**Autenticado + Permissão:** `product:update`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Mochila Premium Atualizada",
  "price": 349.90,
  "description": "Nova descrição"
}
```

### DELETE /products/:id
**Autenticado + Permissão:** `product:delete`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📊 ESTOQUE

### GET /stocks
**Autenticado + Permissão:** `stock:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### POST /stocks
**Autenticado + Permissão:** `stock:manage`

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
  "color": "Preto",
  "quantity": 10
}
```

### PATCH /stocks/:id
**Autenticado + Permissão:** `stock:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "quantity": 15,
  "size": "G",
  "color": "Azul"
}
```

### DELETE /stocks/:id
**Autenticado + Permissão:** `stock:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 🛒 PEDIDOS

### POST /orders
**Autenticado + Permissão:** `order:manage` ou `cart:manage`

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

**Opções de `paymentMethod`:**
- `"pix"` - Desconto de 10%
- `"credit_card"` - Cartão de crédito
- `"debit_card"` - Cartão de débito

### GET /orders
**Autenticado + Permissão:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### GET /orders/me
**Autenticado + Permissão:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### GET /orders/:id
**Autenticado + Permissão:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### PATCH /orders/:id/cancel
**Autenticado + Permissão:** `order:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📍 ENDEREÇOS

### POST /address
**Autenticado + Permissão:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "João Silva",
  "zipCode": "26584-260",
  "phone": "(11)98765-4321",
  "address": "Rua das Flores, 123",
  "additional": "Apto 202",
  "reference": "Próximo ao mercado"
}
```

**⚠️ NOTA:** O primeiro endereço cadastrado será automaticamente definido como padrão. Para trocar o endereço padrão, use `PATCH /address/:id/set-default`.

### GET /address/me
**Autenticado + Permissão:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

### PATCH /address/:id/set-default
**Autenticado + Permissão:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

### DELETE /address/:id
**Autenticado + Permissão:** `address:manage`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 💳 PAGAMENTOS

### POST /payments/card
**Autenticado + Permissão:** `order:manage` ou `cart:manage`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "token_do_mercado_pago",
  "installments": 3,
  "paymentMethodId": "credit_card"
}
```

**⚠️ NOTA:** O `token` deve ser gerado no frontend usando o SDK do Mercado Pago.

---

## 🔐 PERMISSÕES (Apenas OWNER)

### REGRAS

#### GET /permissions/rules
**Autenticado + Permissão:** `rule:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### GET /permissions/rules/:id
**Autenticado + Permissão:** `rule:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### POST /permissions/rules
**Autenticado + Permissão:** `rule:create` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Nova Permissão",
  "slug": "resource:action",
  "description": "Descrição da permissão"
}
```

#### PUT /permissions/rules/:id
**Autenticado + Permissão:** `rule:update` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Permissão Atualizada",
  "slug": "resource:action",
  "description": "Nova descrição"
}
```

#### DELETE /permissions/rules/:id
**Autenticado + Permissão:** `rule:delete` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
```

### PERFIS

#### GET /permissions/profiles
**Autenticado + Permissão:** `profile:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### GET /permissions/profiles/:id
**Autenticado + Permissão:** `profile:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### POST /permissions/profiles
**Autenticado + Permissão:** `profile:create` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "ADMIN_TESTE",
  "description": "Perfil de teste com todas as permissões",
  "ruleIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
}
```

**⚠️ IMPORTANTE:** Para criar um perfil com todas as permissões do OWNER, primeiro liste todas as regras com `GET /permissions/rules` e pegue todos os IDs.

#### PUT /permissions/profiles/:id
**Autenticado + Permissão:** `profile:update` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "ADMIN_TESTE_ATUALIZADO",
  "description": "Descrição atualizada",
  "ruleIds": [1, 2, 3, 4, 5]
}
```

#### DELETE /permissions/profiles/:id
**Autenticado + Permissão:** `profile:delete` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
```

### GERENCIAMENTO DE PERFIS DE USUÁRIO

#### GET /permissions/users/:userId/profiles
**Autenticado + Permissão:** `user:view-profiles`

**Headers:**
```
Authorization: Bearer {{token}}
```

#### POST /permissions/users/:userId/profiles/:profileId
**Autenticado + Permissão:** `user:assign-profile` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
```

**Exemplo:**
```
POST {{base_url}}/permissions/users/1/profiles/2
```

#### DELETE /permissions/users/:userId/profiles/:profileId
**Autenticado + Permissão:** `user:remove-profile` (apenas OWNER)

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📊 DASHBOARD

### GET /dashboard/statistics
**Autenticado + Permissão:** `order:view` ou `user:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

### GET /dashboard/sales-chart
**Autenticado + Permissão:** `order:view`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (opcional):**
```
?days=30
```

---

## 🔔 WEBHOOKS

### POST /webhooks/mercadopago
**Público** - Webhook do Mercado Pago

**Headers:**
```
Content-Type: application/json
x-signature: (assinatura do Mercado Pago)
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

## 📝 COMO CRIAR UM PERFIL COM TODAS AS PERMISSÕES DO OWNER

### Passo 1: Fazer login como OWNER
```
POST {{base_url}}/auth/login
```

### Passo 2: Listar todas as regras
```
GET {{base_url}}/permissions/rules
Authorization: Bearer {{token}}
```

Copie todos os `id` das regras retornadas.

### Passo 3: Criar o perfil com todas as regras
```
POST {{base_url}}/permissions/profiles
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "ADMIN_COMPLETO",
  "description": "Perfil com todas as permissões do sistema",
  "ruleIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
}
```

**⚠️ IMPORTANTE:** Substitua os números pelos IDs reais das regras que você obteve no Passo 2.

### Passo 4: Atribuir o perfil a um usuário
```
POST {{base_url}}/permissions/users/{userId}/profiles/{profileId}
Authorization: Bearer {{token}}
```

Substitua `{userId}` pelo ID do usuário e `{profileId}` pelo ID do perfil criado.

---

## 🎯 ORDEM RECOMENDADA DE TESTES

1. **Criar usuário** → `POST /users`
2. **Fazer login** → `POST /auth/login` (salvar token)
3. **Criar endereço** → `POST /address`
4. **Listar produtos** → `GET /products`
5. **Criar produto** → `POST /products` (precisa de permissão)
6. **Criar estoque** → `POST /stocks` (precisa de permissão)
7. **Criar pedido** → `POST /orders`
8. **Ver pedidos** → `GET /orders/me`
9. **Ver dashboard** → `GET /dashboard/statistics` (precisa de permissão)

---

## ⚠️ NOTAS IMPORTANTES

1. **Token JWT:** Após fazer login, copie o `access_token` e use no header `Authorization: Bearer {token}`
2. **Permissões:** A maioria das rotas precisa de permissões específicas. Use um usuário com perfil OWNER para testar tudo.
3. **Criar perfil OWNER:** Primeiro usuário precisa ter o perfil OWNER atribuído manualmente via banco de dados ou endpoint.
4. **Produtos com imagens:** Use `multipart/form-data` e adicione as imagens no campo `files`.
5. **IDs dinâmicos:** Os IDs retornados nas respostas devem ser usados nas próximas requisições.
