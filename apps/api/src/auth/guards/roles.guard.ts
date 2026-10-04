import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  //to use reflector in the function
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    //get required Roles from the list of decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;
    // getRequest().user because the strategy returns user object .. appendedt to next request
    const user = context.switchToHttp().getRequest().user;

    // Fail closed: an unauthenticated request must never reach a role check.
    if (!user) throw new UnauthorizedException();

    return requiredRoles.some((role) => user.role === role);
  }
}
