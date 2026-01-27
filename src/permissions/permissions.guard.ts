import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from './permissions.service';
import { Request } from 'express';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as { sub: number; name?: string; email?: string; permissions?: string[] } | undefined;

    // Verifica se o usuário está autenticado
    if (!user || !user.sub) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const userId = user.sub;

    const hasPermission = await Promise.all(
      requiredPermissions.map((permission) =>
        this.permissionsService.hasPermission(userId, permission),
      ),
    );

    if (!hasPermission.some((has) => has)) {
      throw new ForbiddenException(
        `Acesso negado. Permissões necessárias: ${requiredPermissions.join(' ou ')}`,
      );
    }

    return true;
  }
}
