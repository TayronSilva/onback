import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async createUserAsync(createUserDto: CreateUserDto) {
    const user = await this.prismaService.client.user.findUnique({
      where: { cpf: createUserDto.cpf },
    });

    if (user) throw new ConflictException('CPF already registered');

    const customerProfile = await this.prismaService.client.accessProfile.findUnique({
      where : { name: 'CUSTOMER' }
    });

    if (!customerProfile) throw new Error('Customer profile not configured.');

    const salt = 6;
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    return this.prismaService.client.user.create({
      data: {
        ...createUserDto,
        accessProfileId: customerProfile.id,
        password: hashedPassword,
      },
    });
  }

  async findUserEmailAsync(email: string) {
    const user = await this.prismaService.client.user.findFirst({
      where: { email },
      include: {
        accessProfile: { include: { rules: true } }
      }
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
      select: { id: true, name: true, email: true, cpf: true }
    });
  }

  

}