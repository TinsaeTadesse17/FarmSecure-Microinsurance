import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../constants/roles.enum';

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    this.logger.verbose('Starting role verification');

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    this.logger.debug(`Required roles: ${requiredRoles?.join(', ') || 'none'}`);

    if (!requiredRoles) {
      this.logger.debug('No role requirements - access granted');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.error('No user object found in request');
      throw new ForbiddenException('Access denied: no user found');
    }

    if (!user.role) {
      this.logger.error('User has no roles assigned', { userId: user.sub });
      throw new ForbiddenException('Access denied: no role found');
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    this.logger.debug(`User roles: ${userRoles.join(', ')}`);

    const hasRole = requiredRoles.some(requiredRole => 
      userRoles.some(userRole => {
        const roleMatch = userRole.toLowerCase() === requiredRole.toLowerCase();
        this.logger.verbose(`Checking ${userRole} against ${requiredRole}: ${roleMatch}`);
        return roleMatch;
      })
    );

    if (!hasRole) {
      this.logger.warn('Role check failed', {
        requiredRoles,
        userRoles,
        userId: user.sub
      });
      throw new ForbiddenException('Access denied: insufficient role');
    }

    this.logger.debug('Role verification passed');
    return true;
  }
}