import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) { }

  async createUserAsync(createUserDto: CreateUserDto) {
    const user = await this.prismaService.client.user.findUnique({
      where: { cpf: createUserDto.cpf },
    });

    if (user) throw new ConflictException('CPF already registered');

    const customerProfile = await this.prismaService.client.accessProfile.findUnique({
      where: { name: 'CUSTOMER' }
    });

    if (!customerProfile) throw new Error('Customer profile not configured.');

    const salt = Number(process.env.BCRYPT_SALT) || 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    return this.prismaService.client.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
          isActive: true,
          profiles: {
            create: {
              accessProfileId: customerProfile.id,
            },
          },
        },
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
      return newUser;
    });
  }

  async findUserEmailAsync(email: string) {
    const user = await this.prismaService.client.user.findUnique({
      where: { email },
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateSelfAsync(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const dataToUpdate: any = {};
    if (updateUserDto.name) dataToUpdate.name = updateUserDto.name;
    if (updateUserDto.password) dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 6);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.prismaService.client.user.findUnique({ where: { email: updateUserDto.email } });
      if (emailExists) throw new ConflictException('Email already in use');
      dataToUpdate.email = updateUserDto.email;
    }

    if (Object.keys(dataToUpdate).length === 0) return user;

    return this.prismaService.client.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });
  }

  async deactivateUserAsync(userId: number) {
    const user = await this.prismaService.client.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prismaService.client.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });
  }
}