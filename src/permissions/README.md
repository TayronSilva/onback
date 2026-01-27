# Sistema de Permissões (RBAC)

Este módulo implementa um sistema RBAC (Role-Based Access Control) baseado em permissões, onde o poder do sistema vem das regras (permissões) e não de cargos fixos.

## Conceitos

### OWNER
- Perfil supremo que possui **todas as permissões automaticamente**
- Não é hardcoded - é apenas um perfil com todas as regras
- Único que pode criar novas regras, criar perfis e atribuir regras a perfis

### AccessProfiles
- Conjuntos de regras (permissões)
- Exemplos: `CUSTOMER`, `MOD_STOCK`, `ADMIN_PRODUCTS`, `DESIGNER_SITE`, etc.
- Criados e gerenciados pelo OWNER
- Usuários podem ter múltiplos perfis

### Rules (Regras/Permissões)
- Permissões granulares do sistema
- Formato: `recurso:ação` (ex: `product:create`, `order:view`)
- Criadas e gerenciadas pelo OWNER

## Como Usar

### 1. Proteger uma rota com permissão

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@Controller('products')
export class ProductController {
  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('product:create')
  async createProduct(@Body() dto: CreateProductDto) {
    // Apenas usuários com permissão 'product:create' ou OWNER podem acessar
  }
}
```

### 2. Múltiplas permissões (OR lógico)

Se você passar múltiplas permissões, o usuário precisa ter **pelo menos uma** delas:

```typescript
@RequirePermission('product:create', 'product:update')
@Post('products')
async createOrUpdateProduct() {
  // Usuário precisa ter 'product:create' OU 'product:update'
}
```

### 3. Verificar permissão no código

```typescript
import { PermissionsService } from '../permissions/permissions.service';

constructor(private permissionsService: PermissionsService) {}

async someMethod(userId: number) {
  const canCreate = await this.permissionsService.hasPermission(userId, 'product:create');
  
  if (!canCreate) {
    throw new ForbiddenException('Sem permissão para criar produtos');
  }
  
  // ... lógica
}
```

### 4. Obter todas as permissões de um usuário

```typescript
const permissions = await this.permissionsService.getUserPermissions(userId);
// OWNER retorna todas as permissões existentes no sistema
// Outros usuários retornam apenas as permissões dos seus perfis
```

### 5. Verificar se é OWNER

```typescript
const isOwner = await this.permissionsService.isOwner(userId);
if (isOwner) {
  // OWNER tem acesso total
}
```

## Endpoints de Gerenciamento (apenas OWNER)

### Regras
- `POST /permissions/rules` - Criar regra
- `GET /permissions/rules` - Listar regras
- `GET /permissions/rules/:id` - Obter regra
- `PUT /permissions/rules/:id` - Atualizar regra
- `DELETE /permissions/rules/:id` - Deletar regra

### Perfis
- `POST /permissions/profiles` - Criar perfil
- `GET /permissions/profiles` - Listar perfis
- `GET /permissions/profiles/:id` - Obter perfil
- `PUT /permissions/profiles/:id` - Atualizar perfil
- `DELETE /permissions/profiles/:id` - Deletar perfil

### Perfis de Usuário
- `POST /permissions/users/:userId/profiles/:profileId` - Atribuir perfil
- `DELETE /permissions/users/:userId/profiles/:profileId` - Remover perfil
- `GET /permissions/users/:userId/profiles` - Listar perfis do usuário

## Fluxo de Verificação

1. **AuthGuard** verifica se o token JWT é válido e adiciona `user` na request
2. **PermissionsGuard** verifica se o usuário tem as permissões requeridas
3. Se o usuário tem perfil **OWNER**, automaticamente tem todas as permissões
4. Caso contrário, verifica se o usuário tem pelo menos uma das permissões requeridas

## Exemplos de Permissões

- `product:view` - Visualizar produtos
- `product:create` - Criar produtos
- `product:update` - Editar produtos
- `product:delete` - Deletar produtos
- `stock:view` - Visualizar estoque
- `stock:manage` - Gerenciar estoque
- `order:view` - Visualizar pedidos
- `order:manage` - Gerenciar pedidos
- `rule:create` - Criar regras (apenas OWNER)
- `profile:create` - Criar perfis (apenas OWNER)

## Notas Importantes

- O OWNER **não é hardcoded** - é apenas um perfil especial que possui todas as regras
- Usuários podem ter **múltiplos perfis** simultaneamente
- Permissões são **granulares** e podem ser combinadas em perfis específicos
- O sistema é **escalável** - novas regras podem ser criadas conforme necessário
