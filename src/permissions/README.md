# Permission System (RBAC)

This module implements a permission-based RBAC (Role-Based Access Control) system, where the system's power comes from rules (permissions) rather than fixed roles.

## Concepts

### OWNER
- Supreme profile that has **all permissions automatically**.
- Not hardcoded - it's just a profile with all rules.
- Only one who can create new rules, create profiles, and assign rules to profiles.

### AccessProfiles
- Sets of rules (permissions).
- Examples: `CUSTOMER`, `MOD_STOCK`, `ADMIN_PRODUCTS`, `DESIGNER_SITE`, etc.
- Created and managed by the OWNER.
- Users can have multiple profiles.

### Rules (Permissions)
- Granular system permissions.
- Format: `resource:action` (e.g., `product:create`, `order:view`).
- Created and managed by the OWNER.

## How to Use

### 1. Protecting a route with permission

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
    // Only users with 'product:create' permission or OWNER can access
  }
}
```

### 2. Multiple permissions (Logical OR)

If you pass multiple permissions, the user needs to have **at least one** of them:

```typescript
@RequirePermission('product:create', 'product:update')
@Post('products')
async createOrUpdateProduct() {
  // User needs to have 'product:create' OR 'product:update'
}
```

### 3. Checking permission in code

```typescript
import { PermissionsService } from '../permissions/permissions.service';

constructor(private permissionsService: PermissionsService) {}

async someMethod(userId: number) {
  const canCreate = await this.permissionsService.hasPermission(userId, 'product:create');
  
  if (!canCreate) {
    throw new ForbiddenException('No permission to create products');
  }
  
  // ... logic
}
```

### 4. Getting all permissions of a user

```typescript
const permissions = await this.permissionsService.getUserPermissions(userId);
// OWNER returns all existing permissions in the system
// Other users return only the permissions from their profiles
```

### 5. Checking if user is OWNER

```typescript
const isOwner = await this.permissionsService.isOwner(userId);
if (isOwner) {
  // OWNER has full access
}
```

## Management Endpoints (OWNER only)

### Rules
- `POST /permissions/rules` - Create rule
- `GET /permissions/rules` - List rules
- `GET /permissions/rules/:id` - Get rule
- `PUT /permissions/rules/:id` - Update rule
- `DELETE /permissions/rules/:id` - Delete rule

### Profiles
- `POST /permissions/profiles` - Create profile
- `GET /permissions/profiles` - List profiles
- `GET /permissions/profiles/:id` - Get profile
- `PUT /permissions/profiles/:id` - Update profile
- `DELETE /permissions/profiles/:id` - Delete profile

### User Profiles
- `POST /permissions/users/:userId/profiles/:profileId` - Assign profile
- `DELETE /permissions/users/:userId/profiles/:profileId` - Remove profile
- `GET /permissions/users/:userId/profiles` - List user profiles

## Verification Flow

1. **AuthGuard** verifies if the JWT token is valid and adds `user` to the request.
2. **PermissionsGuard** verifies if the user has the required permissions.
3. If the user has the **OWNER** profile, they automatically have all permissions.
4. Otherwise, it checks if the user has at least one of the required permissions.

## Permission Examples

- `product:view` - View products
- `product:create` - Create products
- `product:update` - Edit products
- `product:delete` - Delete products
- `stock:view` - View stock
- `stock:manage` - Manage stock
- `order:view` - View orders
- `order:manage` - Manage orders
- `rule:create` - Create rules (OWNER only)
- `profile:create` - Create profiles (OWNER only)

## Important Notes

- The OWNER **is not hardcoded** - it's just a special profile that has all rules.
- Users can have **multiple profiles** simultaneously.
- Permissions are **granular** and can be combined into specific profiles.
- The system is **scalable** - new rules can be created as needed.
