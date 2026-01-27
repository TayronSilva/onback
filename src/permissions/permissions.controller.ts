import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from './permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(AuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('rules')
  @RequirePermission('rule:create')
  @ApiOperation({ summary: 'Criar nova regra (apenas OWNER)' })
  @ApiResponse({ status: 201, description: 'Regra criada com sucesso' })
  async createRule(
    @Body() data: { name: string; slug: string; description?: string },
    @Request() req,
  ) {
    const userId = req.user.sub;
    const canManage = await this.permissionsService.canManageRules(userId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode criar regras');
    }
    return this.permissionsService.createRule(data);
  }

  @Get('rules')
  @RequirePermission('rule:view')
  @ApiOperation({ summary: 'Listar todas as regras' })
  async findAllRules() {
    return this.permissionsService.findAllRules();
  }

  @Get('rules/:id')
  @RequirePermission('rule:view')
  @ApiOperation({ summary: 'Obter regra por ID' })
  async findRuleById(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findRuleById(id);
  }

  @Put('rules/:id')
  @RequirePermission('rule:update')
  @ApiOperation({ summary: 'Atualizar regra (apenas OWNER)' })
  async updateRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; slug?: string; description?: string },
    @Request() req,
  ) {
    const userId = req.user.sub;
    const canManage = await this.permissionsService.canManageRules(userId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode atualizar regras');
    }
    return this.permissionsService.updateRule(id, data);
  }

  @Delete('rules/:id')
  @RequirePermission('rule:delete')
  @ApiOperation({ summary: 'Deletar regra (apenas OWNER)' })
  async deleteRule(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.sub;
    const canManage = await this.permissionsService.canManageRules(userId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode deletar regras');
    }
    return this.permissionsService.deleteRule(id);
  }

  @Post('profiles')
  @RequirePermission('profile:create')
  @ApiOperation({ summary: 'Criar novo perfil (apenas OWNER)' })
  @ApiResponse({ status: 201, description: 'Perfil criado com sucesso' })
  async createProfile(
    @Body() data: { name: string; description?: string; ruleIds?: number[] },
    @Request() req,
  ) {
    const userId = req.user.sub;
    const canManage = await this.permissionsService.canManageProfiles(userId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode criar perfis');
    }
    return this.permissionsService.createProfile(data);
  }

  @Get('profiles')
  @RequirePermission('profile:view')
  @ApiOperation({ summary: 'Listar todos os perfis' })
  async findAllProfiles() {
    return this.permissionsService.findAllProfiles();
  }

  @Get('profiles/:id')
  @RequirePermission('profile:view')
  @ApiOperation({ summary: 'Obter perfil por ID' })
  async findProfileById(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findProfileById(id);
  }

  @Put('profiles/:id')
  @RequirePermission('profile:update')
  @ApiOperation({ summary: 'Atualizar perfil (apenas OWNER)' })
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; description?: string; ruleIds?: number[] },
    @Request() req,
  ) {
    const userId = req.user.sub;
    const canManage = await this.permissionsService.canManageProfiles(userId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode atualizar perfis');
    }
    return this.permissionsService.updateProfile(id, data);
  }

  @Delete('profiles/:id')
  @RequirePermission('profile:delete')
  @ApiOperation({ summary: 'Deletar perfil (apenas OWNER)' })
  async deleteProfile(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.sub;
    const canManage = await this.permissionsService.canManageProfiles(userId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode deletar perfis');
    }
    return this.permissionsService.deleteProfile(id);
  }

  @Post('users/:userId/profiles/:profileId')
  @RequirePermission('user:assign-profile')
  @ApiOperation({ summary: 'Atribuir perfil a usuário (apenas OWNER)' })
  async assignProfileToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Request() req,
  ) {
    const currentUserId = req.user.sub;
    const canManage = await this.permissionsService.canManageProfiles(currentUserId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode atribuir perfis');
    }
    return this.permissionsService.assignProfileToUser(userId, profileId);
  }

  @Delete('users/:userId/profiles/:profileId')
  @RequirePermission('user:remove-profile')
  @ApiOperation({ summary: 'Remover perfil de usuário (apenas OWNER)' })
  async removeProfileFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Request() req,
  ) {
    const currentUserId = req.user.sub;
    const canManage = await this.permissionsService.canManageProfiles(currentUserId);
    if (!canManage) {
      throw new ForbiddenException('Apenas OWNER pode remover perfis');
    }
    return this.permissionsService.removeProfileFromUser(userId, profileId);
  }

  @Get('users/:userId/profiles')
  @RequirePermission('user:view-profiles')
  @ApiOperation({ summary: 'Listar perfis de um usuário' })
  async getUserProfiles(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionsService.getUserProfiles(userId);
  }
}
