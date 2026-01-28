# 🛒 OnBack Backend

Backend completo para e-commerce desenvolvido com NestJS, Prisma e PostgreSQL. Sistema robusto de autenticação, autorização baseada em perfis e permissões hierárquicas.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Sistema de Permissões](#-sistema-de-permissões)
- [API Endpoints](#-api-endpoints)
- [Usuários de Exemplo](#-usuários-de-exemplo)
- [Documentação](#-documentação)

## ✨ Características

- 🔐 **Autenticação JWT** - Sistema seguro de autenticação
- 🛡️ **Autorização Baseada em Perfis** - 11 perfis hierárquicos com 26 regras de permissão
- 📦 **Gestão de Produtos** - CRUD completo com imagens e estoque
- 🛒 **Sistema de Pedidos** - Criação, gerenciamento e cancelamento
- 💳 **Integração Mercado Pago** - Pagamentos via cartão e webhooks
- 📍 **Endereços** - Gerenciamento de múltiplos endereços por usuário
- 📊 **Dashboard** - Estatísticas e gráficos de vendas
- ✅ **Validação Automática** - DTOs validados com class-validator
- 🧪 **Pronto para Testes** - Estrutura preparada para testes E2E

## 🚀 Tecnologias

- **Framework:** NestJS 11
- **Linguagem:** TypeScript
- **ORM:** Prisma 7
- **Banco de Dados:** PostgreSQL (Neon)
- **Autenticação:** JWT (passport-jwt)
- **Validação:** class-validator, class-transformer
- **Upload:** Multer (armazenamento em memória)
- **Pagamentos:** Mercado Pago SDK
- **Storage:** Supabase (para imagens)

## 📦 Pré-requisitos

- Node.js >= 18.x
- npm ou yarn
- PostgreSQL (ou Neon)
- Conta no Supabase (para armazenamento de imagens)
- Conta no Mercado Pago (para pagamentos)

## 🔧 Instalação

```bash
# Clone o repositório
git clone <https://github.com/TayronSilva/onback>
cd onback-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

## ⚙️ Configuração

Edite o arquivo `.env` com suas credenciais:

```env
# Banco de Dados
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# JWT
JWT_SECRET=seu_secret_jwt_aqui

# Supabase (para armazenamento de imagens)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=sua_chave_aqui

# Mercado Pago (opcional)
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui

# Porta (opcional, padrão: 3000)
PORT=3000
```

## 🏃 Executando o Projeto

```bash
# Desenvolvimento (com watch mode)
npm run start:dev

# Produção
npm run build
npm run start:prod

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Popular banco com dados iniciais
npx prisma db seed
```

O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
onback-backend/
├── src/
│   ├── address/          # Gerenciamento de endereços
│   ├── auth/             # Autenticação e JWT
│   ├── dashboard/        # Estatísticas e gráficos
│   ├── order/            # Sistema de pedidos
│   ├── payment/          # Integração Mercado Pago
│   ├── permissions/      # Sistema de permissões
│   ├── product/          # CRUD de produtos
│   ├── stock/            # Gerenciamento de estoque
│   ├── users/            # Gerenciamento de usuários
│   ├── webhooks/         # Webhooks Mercado Pago
│   └── main.ts           # Bootstrap da aplicação
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   └── seed.ts           # Seed com perfis e usuários
├── database/
│   └── prisma/           # Serviço Prisma
├── scripts/
│   └── check-users.ts    # Script para verificar usuários
├── POSTMAN_GUIDE.md      # Guia completo de rotas
├── POSTMAN_COLLECTION.json # Coleção do Postman
└── ROTAS_COMPLETAS.md    # Referência rápida de rotas
```

## 🔐 Sistema de Permissões

### Perfis Hierárquicos

O sistema possui **11 perfis de acesso** organizados hierarquicamente:

#### Perfis Principais:
1. **OWNER** 👑 - Acesso total ao sistema (todas as 26 regras)
2. **ADMIN** 👔 - Quase tudo, exceto gerenciar perfis/regras
3. **MANAGER** 📊 - Gerencia produtos, estoque, pedidos e pagamentos
4. **STAFF** 👷 - Visualiza e edita produtos, gerencia estoque
5. **SUPPORT** 🎧 - Visualiza pedidos, usuários e endereços
6. **VIEWER** 👁️ - Apenas visualização

#### Perfis Específicos:
7. **CUSTOMER** - Perfil padrão para novos usuários
8. **MOD_STOCK** - Moderador de estoque
9. **ADMIN_PRODUCTS** - Administrador de produtos
10. **DESIGNER_SITE** - Designer (visualiza e edita produtos)
11. **ORDER_MANAGER** - Gerente de pedidos

### Regras de Permissão (26 regras)

#### Produtos
- `product:view` - Visualizar produtos
- `product:create` - Criar produtos
- `product:update` - Editar produtos
- `product:delete` - Deletar produtos

#### Estoque
- `stock:view` - Visualizar estoque
- `stock:manage` - Gerenciar estoque

#### Pedidos
- `order:view` - Visualizar pedidos
- `order:manage` - Gerenciar pedidos
- `cart:manage` - Gerenciar carrinho

#### Usuários
- `user:view` - Visualizar usuários
- `user:manage` - Gerenciar usuários
- `user:view-profiles` - Visualizar perfis de usuário
- `user:assign-profile` - Atribuir perfil (apenas OWNER)
- `user:remove-profile` - Remover perfil (apenas OWNER)

#### Endereços
- `address:manage` - Gerenciar endereços

#### Regras e Perfis (Meta-permissões)
- `rule:view`, `rule:create`, `rule:update`, `rule:delete`
- `profile:view`, `profile:create`, `profile:update`, `profile:delete`

#### Pagamentos e Webhooks
- `payment:view`, `payment:manage`
- `webhook:manage`

## 📡 API Endpoints

### Autenticação
- `POST /auth/login` - Login e obtenção de token JWT

### Usuários
- `POST /users` - Criar novo usuário (público)
- `PATCH /users/me` - Atualizar próprio perfil (autenticado)

### Produtos
- `GET /products` - Listar produtos (público)
- `GET /products/:id` - Obter produto específico (público)
- `POST /products` - Criar produto (`product:create`)
- `PATCH /products/:id` - Atualizar produto (`product:update`)
- `DELETE /products/:id` - Deletar produto (`product:delete`)

### Estoque
- `GET /stocks` - Listar estoque (`stock:view`)
- `POST /stocks` - Criar estoque (`stock:manage`)
- `PATCH /stocks/:id` - Atualizar estoque (`stock:manage`)
- `DELETE /stocks/:id` - Deletar estoque (`stock:manage`)

### Pedidos
- `POST /orders` - Criar pedido (`order:manage` ou `cart:manage`)
- `GET /orders` - Listar todos os pedidos (`order:view`)
- `GET /orders/me` - Meus pedidos (`order:view`)
- `GET /orders/:id` - Obter pedido específico (`order:view`)
- `PATCH /orders/:id/cancel` - Cancelar pedido (`order:manage`)

### Endereços
- `POST /address` - Criar endereço (`address:manage`)
- `GET /address/me` - Meus endereços (`address:manage`)
- `PATCH /address/:id/set-default` - Definir endereço padrão (`address:manage`)
- `DELETE /address/:id` - Deletar endereço (`address:manage`)

### Pagamentos
- `POST /payments/card` - Pagar com cartão (`order:manage` ou `cart:manage`)

### Dashboard
- `GET /dashboard/statistics` - Estatísticas (`order:view` ou `user:view`)
- `GET /dashboard/sales-chart` - Gráfico de vendas (`order:view`)

### Permissões (apenas OWNER)
- `GET /permissions/rules` - Listar regras
- `POST /permissions/rules` - Criar regra
- `PUT /permissions/rules/:id` - Atualizar regra
- `DELETE /permissions/rules/:id` - Deletar regra
- `GET /permissions/profiles` - Listar perfis
- `POST /permissions/profiles` - Criar perfil
- `PUT /permissions/profiles/:id` - Atualizar perfil
- `DELETE /permissions/profiles/:id` - Deletar perfil
- `POST /permissions/users/:userId/profiles/:profileId` - Atribuir perfil
- `DELETE /permissions/users/:userId/profiles/:profileId` - Remover perfil

### Webhooks
- `POST /webhooks/mercadopago` - Webhook Mercado Pago (público)

📖 **Documentação completa:** Veja `POSTMAN_GUIDE.md` para exemplos detalhados de todas as rotas.

## 👤 Usuários de Exemplo

Após executar o seed (`npx prisma db seed`), os seguintes usuários são criados:

| Email | Perfil | Senha | Descrição |
|-------|--------|-------|-----------|
| `owner@onback.com` | OWNER | `senha123` | Acesso total ao sistema |
| `admin@onback.com` | ADMIN | `senha123` | Quase tudo, exceto perfis/regras |
| `manager@onback.com` | MANAGER | `senha123` | Gerencia operações do dia a dia |
| `staff@onback.com` | STAFF | `senha123` | Operações básicas de produtos |
| `support@onback.com` | SUPPORT | `senha123` | Atendimento ao cliente |
| `viewer@onback.com` | VIEWER | `senha123` | Apenas visualização |

## 📚 Documentação

- **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** - Guia completo com exemplos de todas as rotas
- **[POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)** - Coleção pronta para importar no Postman
- **[ROTAS_COMPLETAS.md](./ROTAS_COMPLETAS.md)** - Referência rápida de todas as rotas

## 🗄️ Banco de Dados

### Modelos Principais

- **User** - Usuários do sistema
- **AccessProfile** - Perfis de acesso
- **Rule** - Regras de permissão
- **UserProfile** - Relação usuário-perfil
- **Product** - Produtos
- **Stock** - Estoque de produtos
- **ProductImages** - Imagens dos produtos
- **Order** - Pedidos
- **OrderItem** - Itens do pedido
- **Address** - Endereços dos usuários

### Seed

O seed (`prisma/seed.ts`) cria automaticamente:
- ✅ 26 regras de permissão
- ✅ 11 perfis de acesso
- ✅ 6 usuários de exemplo

Execute: `npx prisma db seed`

## 🔒 Segurança

- Senhas são hashadas com bcrypt (salt rounds: 6)
- Tokens JWT expiram em 1 hora
- Validação automática de DTOs com `ValidationPipe`
- Guards protegem rotas sensíveis
- CORS habilitado para desenvolvimento

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes em watch mode
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📝 Scripts Disponíveis

```bash
npm run start:dev      # Desenvolvimento com watch
npm run build          # Build para produção
npm run start:prod     # Executar produção
npm run lint           # Linter
npm run format         # Formatar código
npm run test           # Testes unitários
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e não possui licença pública.

## 👨‍💻 Autor

Desenvolvido para o projeto OnBack.

---

**🚀 Pronto para começar?** Execute `npm install`, configure o `.env` e rode `npm run start:dev`!
