import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../jwt-payload.interface';

// auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.verbose('Starting JWT authentication');

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      this.logger.debug('Route is public - bypassing auth');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      this.logger.error('Authorization header missing');
      throw new UnauthorizedException('Missing Authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.error('Invalid Authorization header format');
      throw new UnauthorizedException('Invalid token format');
    }

    const token = authHeader.split(' ')[1];
    this.logger.debug(`Extracted token: ${token?.substring(0, 10)}...`);

    try {
      const payload = await this.authService.validateToken(token);
      this.logger.debug('Token validated', { 
        user: payload.sub, 
        roles: payload.role 
      });

      // Normalize roles to ensure array format
      const roles = Array.isArray(payload.role) ? payload.role : [payload.role];
      
      request.user = {
        sub: payload.sub,
        username: payload.username,
        role: roles,
        company_id: payload.company_id
      };

      this.logger.verbose('User attached to request', { 
        user: { 
          sub: request.user.sub, 
          roles: request.user.role 
        } 
      });
      
      return true;
    } catch (error) {
      this.logger.error('Authentication failed', { 
        error: error.message,
        stack: error.stack 
      });
      throw new UnauthorizedException('Invalid token');
    }
  }
}