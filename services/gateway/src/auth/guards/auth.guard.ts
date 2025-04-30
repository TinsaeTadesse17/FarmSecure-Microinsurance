// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

    const [, token] = authHeader.split(' ');

    if (!token) throw new UnauthorizedException('Invalid Authorization format');

    const payload = await this.authService.validateToken(token);
    request.user = payload; // Attach decoded user info to the request
    return true;
  }
}
