import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrae el token del encabezado Authorization como Bearer token.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Si el token ha expirado, lo rechaza automáticamente.
      ignoreExpiration: false,
      // Define el secreto para verificar el token.
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
    });
  }

  /**
   * El método validate es llamado automáticamente después de verificar
   * la firma del token. Su tarea es extraer o validar la información del payload.
   *
   * @param payload La carga útil decodificada del token JWT.
   * @returns Un objeto con la información del usuario que se adjuntará a la petición.
   */
  validate(payload: any) {
    // Retorna la información que quieras inyectar en el request (por ejemplo, id, email, role, etc.).
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
