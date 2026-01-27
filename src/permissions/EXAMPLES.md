# Exemplos de Uso do Sistema de Permissões

## Exemplo 1: Rota Pública (sem autenticação)

```typescript
@Controller('products')
export class ProductController {
  @Get()
  // Sem guards - rota pública
  findAll() {
    return this.service.findAll();
  }
}
```

## Exemplo 2: Rota Autenticada (sem verificação de permissão)

```typescript
@Controller('orders')
export class OrderController {
  @Get('me')
  @UseGuards(AuthGuard)
  // Apenas autenticação necessária
  findMyOrders(@Request() req) {
    const userId = req.user.sub;
    return this.service.findByUser(userId);
  }
}
```

## Exemplo 3: Rota com Permissão Única

```typescript
@Controller('products')
export class ProductController {
  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('product:create')
  create(@Body() dto: CreateProductDto) {
    // Apenas usuários com 'product:create' ou OWNER podem acessar
    return this.service.create(dto);
  }
}
```

## Exemplo 4: Rota com Múltiplas Permissões (OR)

```typescript
@Controller('products')
export class ProductController {
  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('product:update', 'product:create')
  // Usuário precisa ter 'product:update' OU 'product:create'
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }
}
```

## Exemplo 5: Guard no Nível do Controller

```typescript
@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminController {
  // Todas as rotas deste controller precisam de autenticação
  
  @Get('dashboard')
  @RequirePermission('admin:dashboard')
  getDashboard() {
    return { message: 'Dashboard' };
  }
  
  @Get('users')
  @RequirePermission('user:view')
  getUsers() {
    return this.userService.findAll();
  }
}
```

## Exemplo 6: Verificação Manual de Permissão

```typescript
@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async create(userId: number, dto: CreateProductDto) {
    // Verificação manual
    const canCreate = await this.permissionsService.hasPermission(
      userId,
      'product:create',
    );

    if (!canCreate) {
      throw new ForbiddenException('Sem permissão para criar produtos');
    }

    return this.prisma.product.create({ data: dto });
  }
}
```

## Exemplo 7: Verificar se é OWNER

```typescript
@Injectable()
export class AdminService {
  constructor(private permissionsService: PermissionsService) {}

  async deleteEverything(userId: number) {
    // Apenas OWNER pode fazer isso
    const isOwner = await this.permissionsService.isOwner(userId);
    
    if (!isOwner) {
      throw new ForbiddenException('Apenas OWNER pode executar esta ação');
    }

    // ... lógica perigosa
  }
}
```

## Exemplo 8: Obter Todas as Permissões do Usuário

```typescript
@Get('me/permissions')
@UseGuards(AuthGuard)
async getMyPermissions(@Request() req) {
  const userId = req.user.sub;
  const permissions = await this.permissionsService.getUserPermissions(userId);
  
  return {
    userId,
    permissions,
    isOwner: await this.permissionsService.isOwner(userId),
  };
}
```

## Exemplo 9: Rota com Permissão Condicional

```typescript
@Patch('products/:id')
@UseGuards(AuthGuard, PermissionsGuard)
async updateProduct(
  @Param('id') id: string,
  @Body() dto: UpdateProductDto,
  @Request() req,
) {
  const userId = req.user.sub;
  const product = await this.service.findOne(id);

  // OWNER pode editar qualquer produto
  const isOwner = await this.permissionsService.isOwner(userId);
  
  // Outros usuários precisam de permissão E ser o dono do produto
  if (!isOwner) {
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'product:update',
    );
    
    if (!hasPermission || product.userId !== userId) {
      throw new ForbiddenException('Sem permissão para editar este produto');
    }
  }

  return this.service.update(id, dto);
}
```

## Exemplo 10: Múltiplos Guards com Lógica Customizada

```typescript
@Controller('products')
export class ProductController {
  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('product:delete')
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    const product = await this.service.findOne(id);

    // OWNER pode deletar qualquer coisa
    const isOwner = await this.permissionsService.isOwner(userId);
    
    // Outros precisam de permissão E ser o dono
    if (!isOwner && product.userId !== userId) {
      throw new ForbiddenException('Você só pode deletar seus próprios produtos');
    }

    return this.service.remove(id);
  }
}
```

## Ordem dos Guards

A ordem importa! Sempre use nesta ordem:

1. **AuthGuard** primeiro (valida autenticação)
2. **PermissionsGuard** depois (valida permissões)

```typescript
@UseGuards(AuthGuard, PermissionsGuard) // ✅ Correto
@RequirePermission('product:create')

// ❌ ERRADO - PermissionsGuard precisa do user do AuthGuard
@UseGuards(PermissionsGuard, AuthGuard)
```

## Importar o Módulo

Para usar o `PermissionsGuard` em outros módulos, importe o `PermissionsModule`:

```typescript
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  // ...
})
export class ProductModule {}
```
