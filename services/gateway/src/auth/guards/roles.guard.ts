// roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../constants/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  
    if (!requiredRoles) return true;
  
    const { user } = context.switchToHttp().getRequest();
  
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no user or role found');
    }
  
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException('Access denied: insufficient role');
    }
  
    return true;
  }
}
