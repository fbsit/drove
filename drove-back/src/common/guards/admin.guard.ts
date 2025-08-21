import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }
    const role = user.role || user?.payload?.role;
    if (role === 'ADMIN' || role === 'admin') return true;
    throw new ForbiddenException('Admin role required');
  }
}


