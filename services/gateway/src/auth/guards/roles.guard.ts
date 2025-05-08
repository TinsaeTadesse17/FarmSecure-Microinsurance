// roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    console.log('Extracted user:', user);

    if (!user || !user.role) {
      console.error('Access denied: no user or role found');
      throw new ForbiddenException('Access denied: no user or role found');
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    console.log('User roles:', userRoles);
    console.log('Required roles:', requiredRoles);

    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRole) {
      console.error('Access denied: insufficient role');
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}
