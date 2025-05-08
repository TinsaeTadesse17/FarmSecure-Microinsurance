// auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 📝 Check for @Public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('🚫 Missing or malformed Authorization header');
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      // ✅ Decode and validate the token
      const payload = await this.authService.validateToken(token);
      
      // ✅ Attach the decoded user info to the request object
      request.user = payload;
      
      // ✅ Confirm user is attached
      console.log('✅ User attached to request:', request.user);

      return true;
    } catch (error) {
      console.error('🚫 Token validation failed:', error.message);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}