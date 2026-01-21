import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from 'database/prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prismaService: PrismaService) {}

  async createAddress(userId: number, createAddress: CreateAddressDto) {
    const totalAddresses = await this.prismaService.client.address.count({
      where: { userId },
    });

    const isFirstAddress = totalAddresses === 0;

    return this.prismaService.client.address.create({
      data: {
        ...createAddress,
        userId: userId,
        isDefault: isFirstAddress,
      },
    });
  }

  async setDefault(userId: number, addressId: number) {
    const address = await this.prismaService.client.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new ForbiddenException('You can only update your own addresses');
    }

    return this.prismaService.client.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      return await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  }

  async findAllByUser(userId: number) {
    return this.prismaService.client.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async getMe(userId: number) {
    const user = await this.prismaService.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        address: { 
          select: {
            id: true,
            name: true,
            zipCode: true,
            address: true,
            isDefault: true
          }
        }
      }
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(userId: number, addressId: number) {
  
    const address = await this.prismaService.client.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found or does not belong to the user.');
    }

    return this.prismaService.client.$transaction(async (tx) => {

      await tx.address.delete({
        where: { id: addressId },
      });

      if (address.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return { message: 'Address removed successfully' };
    });
  }
}