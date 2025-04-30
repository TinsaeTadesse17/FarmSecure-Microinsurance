import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const response = await axios.post('http://user-service:8000/api/user/login', {
        username,
        password,
      });

      return response.data; // should return { access_token: ... }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(username: string, password: string) {
    const result = await this.validateUser(username, password);
    return {
      access_token: result.access_token,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
