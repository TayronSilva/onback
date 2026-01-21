import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ParseIntPipe, Delete } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';

@ApiTags('address')
@Controller('address')
@UseGuards(AuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  async create(@Request() req, @Body() dto: CreateAddressDto) {
    const userId = req.user.sub;
    return this.addressService.createAddress(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get user profile with all addresses (Yuri style)' })
  async findFullProfile(@Request() req) {
    const userId = req.user.sub;
    return this.addressService.getMe(userId);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set an address as default' })
  async setDefault(
    @Request() req, 
    @Param('id', ParseIntPipe) addressId: number
  ) {
    const userId = req.user.sub;
    return this.addressService.setDefault(userId, addressId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove address'})
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) addressId: number) {
      const userId = req.user.sub;
      return this.addressService.remove(userId, addressId);
    }
}