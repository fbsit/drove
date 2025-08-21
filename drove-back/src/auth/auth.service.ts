import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/entities/user.entity';
import { ChangePasswordDto } from './dtos/change-password';
import { AuthErrorCode } from './auth-error-code.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida credenciales del usuario comparando contraseña
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status === 'PENDING') {
      throw new ForbiddenException({
        message: 'Usuario no aprobado',
        code: 403,
      });
    }

    if (!user.emailVerified) {
      throw new ForbiddenException({
        message: 'Email no verificado',
        code: 403,
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Excluir password
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Genera JWT con información mínima del usuario
   */
  async login(user: Omit<User, 'password'>) {
    // Obtener nombre completo preferido o construir
    const fullName =
      user.contactInfo.fullName ||
      `${user.contactInfo.firstName} ${user.contactInfo.lastName}`.trim();

    const payload = {
      sub: user.id,
      email: user.email,
      name: fullName,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      expiresIn: process.env.JWT_EXPIRES_IN || '3600',
      user: {
        id: user.id,
        name: fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Refresca el access token usando refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify<{ sub: string; email: string }>(
        refreshToken,
      );
      const user = await this.userService.findOne(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const fullName =
        user.contactInfo.fullName ||
        `${user.contactInfo.firstName} ${user.contactInfo.lastName}`.trim();

      const payload = {
        sub: user.id,
        email: user.email,
        name: fullName,
      };

      const newAccessToken = this.jwtService.sign(payload);
      return { access_token: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password, // Assuming 'password' is the field storing the hashed password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password.');
    }

    if (
      changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword
    ) {
      throw new UnauthorizedException(
        'New password and confirmation do not match.',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10); // Salt rounds: 10
    user.password = hashedPassword;
    await this.userService.save(user);
  }
}
