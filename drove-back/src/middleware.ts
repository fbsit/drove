import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Rutas públicas explícitas
    const publicPaths = [
      '/auth/login',
      '/users',
      '/users/forgot-password',
      '/users/reset-password',
      '/storage/upload/drover',
      '/verifications/email/send-code',
      '/verifications/email/check-code',
      '/support/tickets',
      '/pdf',
      '/payments/webhook',
    ];
    if (publicPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    // In test environment, if an Authorization header is present, decode the JWT
    // without verifying the signature and inject id/email/role to support e2e.
    if (process.env.NODE_ENV === 'test') {
      const parts = authHeader.split(' ');
      if (parts.length === 2) {
        const token = parts[1];
        const payload: any = jwt.decode(token) || {};
        req['user'] = {
          id: payload.sub ?? payload.id,
          sub: payload.sub ?? payload.id,
          email: payload.email,
          role: payload.role,
        };
      }
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Token error');
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      throw new UnauthorizedException('Token malformatted');
    }

    try {
      // Utilizamos la clave secreta definida en las variables de entorno
      // o un valor por defecto ('supersecretkey') en caso de no existir.
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecretkey',
      );
      // Opcional: Puedes adjuntar la información del usuario al request para usarla en los controladores.
      req['user'] = decoded;
      next();
    } catch (err) {
      throw new UnauthorizedException('Token invalid');
    }
  }
}
