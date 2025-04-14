import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth_service:9000';

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      // Fetch user from your Python microservice
      const { data: user } = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/api/users/email/${email}`)
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(pass, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      username: user.username,
      roles: user.roles 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles
      }
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}