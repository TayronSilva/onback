# Permission System Usage Examples

## Example 1: Public Route (no authentication)

```typescript
@Controller('products')
export class ProductController {
  @Get()
  // No guards - public route
  findAll() {
    return this.service.findAll();
  }
}
```

## Example 2: Authenticated Route (no permission check)

```typescript
@Controller('orders')
export class OrderController {
  @Get('me')
  @UseGuards(AuthGuard)
  // Only authentication required
  findMyOrders(@Request() req) {
    const userId = req.user.sub;
    return this.service.findByUser(userId);
  }
}
```

## Example 3: Route with Single Permission

```typescript
@Controller('products')
export class ProductController {
  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('product:create')
  create(@Body() dto: CreateProductDto) {
    // Only users with 'product:create' or OWNER can access
    return this.service.create(dto);
  }
}
```

## Example 4: Route with Multiple Permissions (OR)

```typescript
@Controller('products')
export class ProductController {
  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('product:update', 'product:create')
  // User needs to have 'product:update' OR 'product:create'
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }
}
```

## Example 5: Guard at Controller Level

```typescript
@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminController {
  // All routes in this controller require authentication
  
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

## Example 6: Manual Permission Check

```typescript
@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private permissionsService: PermissionsService,
  ) {}

  async create(userId: number, dto: CreateProductDto) {
    // Manual check
    const canCreate = await this.permissionsService.hasPermission(
      userId,
      'product:create',
    );

    if (!canCreate) {
      throw new ForbiddenException('No permission to create products');
    }

    return this.prisma.product.create({ data: dto });
  }
}
```

## Example 7: Checking if user is OWNER

```typescript
@Injectable()
export class AdminService {
  constructor(private permissionsService: PermissionsService) {}

  async deleteEverything(userId: number) {
    // Only OWNER can do this
    const isOwner = await this.permissionsService.isOwner(userId);
    
    if (!isOwner) {
      throw new ForbiddenException('Only OWNER can perform this action');
    }

    // ... dangerous logic
  }
}
```

## Example 8: Get All User Permissions

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

## Example 9: Route with Conditional Permission

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

  // OWNER can edit any product
  const isOwner = await this.permissionsService.isOwner(userId);
  
  // Other users need permission AND must be the product owner
  if (!isOwner) {
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'product:update',
    );
    
    if (!hasPermission || product.userId !== userId) {
      throw new ForbiddenException('No permission to edit this product');
    }
  }

  return this.service.update(id, dto);
}
```

## Example 10: Multiple Guards with Custom Logic

```typescript
@Controller('products')
export class ProductController {
  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('product:delete')
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    const product = await this.service.findOne(id);

    // OWNER can delete anything
    const isOwner = await this.permissionsService.isOwner(userId);
    
    // Others need permission AND must be the owner
    if (!isOwner && product.userId !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    return this.service.remove(id);
  }
}
```

## Guard Order

Order matters! Always use in this order:

1. **AuthGuard** first (validates authentication)
2. **PermissionsGuard** second (validates permissions)

```typescript
@UseGuards(AuthGuard, PermissionsGuard) // ✅ Correct
@RequirePermission('product:create')

// ❌ WRONG - PermissionsGuard needs the user from AuthGuard
@UseGuards(PermissionsGuard, AuthGuard)
```

## Import the Module

To use `PermissionsGuard` in other modules, import `PermissionsModule`:

```typescript
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  // ...
})
export class ProductModule {}
```
