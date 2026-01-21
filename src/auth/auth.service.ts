import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(email: string, password: string): Promise<{
    name: string;
    email: string;
    access_token: string;
    permissions: string[];
  }> {
    const user = await this.userService.findUserEmailAsync(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userData = user as any;
    const permissions: string[] = userData.accessProfile?.rules?.map((rule: any) => rule.slug) || [];

    const payload = { 
      sub: user.id, 
      name: user.name || 'User', 
      email: user.email,
      permissions: permissions,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      name: user.name || 'User',
      email: user.email,
      access_token: token,
      permissions: permissions,
    };
  }
}