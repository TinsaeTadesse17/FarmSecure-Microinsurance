import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validates the user's credentials against the FastAPI user service.
   * @param username - The username to validate
   * @param password - The password to validate
   * @returns The access token from the FastAPI service
   */
  async validateUser(username: string, password: string): Promise<any> {
    try {
      const response = await axios.post('http://user-service:8000/api/user/login', {
        username,
        password,
      });

      // ✅ Make sure the token is present in the response
      if (!response.data || !response.data.access_token) {
        console.error('🚫 Missing access token in response:', response.data);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ Login response:', response.data);
      return response.data; // should return { access_token: ... }
    } catch (error) {
      console.error('🚫 Login error:', error.message);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Handles the login process by validating user credentials.
   * @param username - The username to login
   * @param password - The password to login
   * @returns An object containing the access token
   */
  async login(username: string, password: string) {
    try {
      const result = await this.validateUser(username, password);
      return {
        access_token: result.access_token,
      };
    } catch (error) {
      console.error('🚫 Login error:', error.message);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Validates and decodes a JWT token.
   * @param token - The JWT token to validate
   * @returns The decoded JwtPayload
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      // ✅ Decode and validate the token
      const payload = this.jwtService.verify<JwtPayload>(token);
      console.log('✅ Decoded Payload in AuthService:', payload);
  
      // 🚫 Ensure payload has required fields
      if (!payload.sub || !payload.username || !payload.role) {
        console.error('🚫 Invalid token payload:', payload);
        throw new UnauthorizedException('Invalid token payload: missing required fields');
      }
  
      return payload;
    } catch (err) {
      console.error('🚫 Token validation error:', err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
