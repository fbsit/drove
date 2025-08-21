import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtOrTestGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (process.env.NODE_ENV === 'test') {
      const req = context.switchToHttp().getRequest();
      const authHeader: string | undefined = req.headers['authorization'] || req.headers['Authorization'];
      if (authHeader && typeof authHeader === 'string') {
        const parts = authHeader.split(' ');
        if (parts.length === 2) {
          const token = parts[1];
          const payload: any = jwt.decode(token) || {};
          req.user = {
            id: payload.sub ?? payload.id,
            email: payload.email,
            role: payload.role,
          };
          return true;
        }
      }
      return false;
    }
    return super.canActivate(context);
  }
}


