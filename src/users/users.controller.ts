import { Controller, Get, Post, Body, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUserAsync(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    return this.usersService.updateSelfAsync(userId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  @ApiOperation({ summary: 'Deactivate own account' })
  async deactivateMe(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.deactivateUserAsync(userId);
  }

}