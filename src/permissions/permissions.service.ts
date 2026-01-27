import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  private readonly OWNER_PROFILE_NAME = 'OWNER';

  constructor(private prisma: PrismaService) {}

  async hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          include: {
            accessProfile: {
              include: {
                rules: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    const hasOwnerProfile = user.profiles.some(
      (profile) => profile.accessProfile.name === this.OWNER_PROFILE_NAME,
    );

    if (hasOwnerProfile) {
      return true;
    }

    const userPermissions = this.extractPermissionsFromProfiles(user.profiles);
    return userPermissions.includes(permissionSlug);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          include: {
            accessProfile: {
              include: {
                rules: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    const hasOwnerProfile = user.profiles.some(
      (profile) => profile.accessProfile.name === this.OWNER_PROFILE_NAME,
    );

    if (hasOwnerProfile) {
      const allRules = await this.prisma.client.rule.findMany({
        select: { slug: true },
      });
      return allRules.map((rule) => rule.slug);
    }

    return this.extractPermissionsFromProfiles(user.profiles);
  }

  private extractPermissionsFromProfiles(profiles: any[]): string[] {
    const permissions = new Set<string>();
    profiles.forEach((profile) => {
      profile.accessProfile.rules.forEach((rule: any) => {
        permissions.add(rule.slug);
      });
    });
    return Array.from(permissions);
  }

  async isOwner(userId: number): Promise<boolean> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          include: {
            accessProfile: true,
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    return user.profiles.some(
      (profile) => profile.accessProfile.name === this.OWNER_PROFILE_NAME,
    );
  }

  async canManageRules(userId: number): Promise<boolean> {
    return this.isOwner(userId);
  }

  /**
   * Verifica se um usuário pode criar/editar perfis (apenas OWNER)
   */
  async canManageProfiles(userId: number): Promise<boolean> {
    return this.isOwner(userId);
  }

  async createRule(data: { name: string; slug: string; description?: string }) {
    try {
      return await this.prisma.client.rule.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe uma regra com este nome ou slug');
      }
      throw error;
    }
  }

  async findAllRules() {
    return this.prisma.client.rule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRuleById(id: number) {
    const rule = await this.prisma.client.rule.findUnique({
      where: { id },
    });
    if (!rule) {
      throw new NotFoundException('Regra não encontrada');
    }
    return rule;
  }

  async findRuleBySlug(slug: string) {
    const rule = await this.prisma.client.rule.findUnique({
      where: { slug },
    });
    if (!rule) {
      throw new NotFoundException('Regra não encontrada');
    }
    return rule;
  }

  async updateRule(id: number, data: { name?: string; slug?: string; description?: string }) {
    try {
      return await this.prisma.client.rule.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe uma regra com este nome ou slug');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Regra não encontrada');
      }
      throw error;
    }
  }

  async deleteRule(id: number) {
    try {
      return await this.prisma.client.rule.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Regra não encontrada');
      }
      throw error;
    }
  }

  // ========== CRUD de Perfis (apenas OWNER) ==========

  async createProfile(data: { name: string; description?: string; ruleIds?: number[] }) {
    try {
      return await this.prisma.client.accessProfile.create({
        data: {
          name: data.name,
          description: data.description,
          rules: data.ruleIds
            ? {
                connect: data.ruleIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          rules: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um perfil com este nome');
      }
      throw error;
    }
  }

  async findAllProfiles() {
    return this.prisma.client.accessProfile.findMany({
      include: {
        rules: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProfileById(id: number) {
    const profile = await this.prisma.client.accessProfile.findUnique({
      where: { id },
      include: {
        rules: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }
    return profile;
  }

  async findProfileByName(name: string) {
    const profile = await this.prisma.client.accessProfile.findUnique({
      where: { name },
      include: {
        rules: true,
      },
    });
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }
    return profile;
  }

  async updateProfile(
    id: number,
    data: { name?: string; description?: string; ruleIds?: number[] },
  ) {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;

      if (data.ruleIds !== undefined) {
        const currentProfile = await this.prisma.client.accessProfile.findUnique({
          where: { id },
          include: { rules: true },
        });

        if (currentProfile) {
          await this.prisma.client.accessProfile.update({
            where: { id },
            data: {
              rules: {
                set: [],
              },
            },
          });
        }

        // Depois, conecta as novas regras
        updateData.rules = {
          connect: data.ruleIds.map((ruleId) => ({ id: ruleId })),
        };
      }

      return await this.prisma.client.accessProfile.update({
        where: { id },
        data: updateData,
        include: {
          rules: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um perfil com este nome');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Perfil não encontrado');
      }
      throw error;
    }
  }

  async deleteProfile(id: number) {
    try {
      return await this.prisma.client.accessProfile.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Perfil não encontrado');
      }
      throw error;
    }
  }

  async assignProfileToUser(userId: number, profileId: number) {
    try {
      return await this.prisma.client.userProfile.create({
        data: {
          userId,
          accessProfileId: profileId,
        },
        include: {
          accessProfile: {
            include: {
              rules: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Usuário já possui este perfil');
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Usuário ou perfil não encontrado');
      }
      throw error;
    }
  }

  async removeProfileFromUser(userId: number, profileId: number) {
    try {
      return await this.prisma.client.userProfile.delete({
        where: {
          userId_accessProfileId: {
            userId,
            accessProfileId: profileId,
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuário não possui este perfil');
      }
      throw error;
    }
  }

  async getUserProfiles(userId: number) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          include: {
            accessProfile: {
              include: {
                rules: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user.profiles.map((profile) => profile.accessProfile);
  }
}
