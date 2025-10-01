import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User, UserAccountType, DroverEmploymentType } from './entities/user.entity';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updatedUser.dto';
import * as bcrypt from 'bcrypt';
import { mapRawUserTypeToRole } from './../helpers/UserRole';
import { TransferStatus } from '../travels/entities/travel.entity';
import { Travels } from '../travels/entities/travel.entity';
import { ResendService } from '../resend/resend.service';
import { BadRequestException } from '@nestjs/common';
import { classifyId, normalizeId, validateDni, validateNie, isLikelyCompanyName } from './utils/spanish-id';

import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Travels)
    private readonly travelsRepo: Repository<Travels>,
    private readonly resend: ResendService,
  ) {}

  /**
   * Crea un nuevo usuario con encriptación de contraseña
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, userType, contactInfo } = createUserDto;
    this.logger.log(`Create user attempt email=${email} type=${userType}`);
    this.logger.debug(`CreateUserDto.contactInfo=${JSON.stringify(contactInfo ?? {})}`);

    // Verificar duplicados
    const existing = await this.userRepo.findOneBy({
      email,
    } as unknown as FindOptionsWhere<User>);
    if (existing) {
      throw new ConflictException(`El email ${email} ya está registrado.`);
    }

    try {
      const hashed = await bcrypt.hash(password, 10);

      const role = mapRawUserTypeToRole(userType);

      // Clasificación y validación de documento + subtipo de cuenta
      const ci = { ...(contactInfo || {}) } as any;
      if (ci.documentId) {
        ci.documentId = normalizeId(ci.documentId);
        const kind = classifyId(ci.documentId);
        ci.documentType = kind;
        if (kind === 'DNI' && !validateDni(ci.documentId)) {
          throw new BadRequestException('DNI inválido. Formato: 8 dígitos + letra (p.ej. 12345678Z).');
        }
        if (kind === 'NIE' && !validateNie(ci.documentId)) {
          throw new BadRequestException('NIE inválido. Formato: X/Y/Z + 7 dígitos + letra (p.ej. X1234567L).');
        }
      }

      const acctType = (ci?.companyName && String(ci.companyName).trim().length > 0)
        ? UserAccountType.COMPANY
        : (ci.documentType === 'CIF' || isLikelyCompanyName(ci.fullName) || isLikelyCompanyName(ci.companyName))
          ? UserAccountType.COMPANY
          : UserAccountType.PERSON;

      const user = this.userRepo.create({
        email,
        password: hashed,
        role,
        contactInfo: ci,
        accountType: acctType,
        employmentType: role === 'DROVER' ? DroverEmploymentType.FREELANCE : null,
      });
      this.logger.debug(`Persisting user role=${user.role} accountType=${user.accountType}`);
      const created = await this.userRepo.save(user);

      // Enviar verificación de email (server-side) con LINK y código unificado de 6 dígitos
      try {
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
        created.verificationCode = code;
        created.codeExpiresAt = new Date(Date.now() + 10 * 60_000); // 10 minutos
        await this.userRepo.save(created);

        const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
        const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verifyEmail?email=${encodeURIComponent(created.email)}&code=${encodeURIComponent(code)}`;
        const name = created?.contactInfo?.fullName || created.email;
        await this.resend.sendEmailVerificationEmail(created.email, name, verifyUrl);
      } catch (mailErr) {
        // No interrumpir la creación de usuario si falla el envío
      }

      this.logger.log(`User created id=${created.id}`);
      return created;
    } catch (error: any) {
      this.logger.error(`Create user failed: ${error?.message}`, error?.stack);
      if (error?.response?.statusCode === 400 || error?.status === 400) {
        // Repropaga errores 400 de validación para que el front reciba el mensaje específico
        throw error;
      }
      if (error.code === '23505') {
        throw new ConflictException(`El email ${email} ya existe.`);
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async droverDashboard(id: string): Promise<any> {
    const user = await this.userRepo.findOneBy({
      id,
    } as FindOptionsWhere<User>);
    if (!user)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    const travels = await this.travelsRepo.find({
      where: { droverId: id },
    });

    const assignedTrips = travels.length;

    const completedTrips = travels.filter(
      (trip) => trip.status === TransferStatus.DELIVERED,
    ).length;

    const totalEarnings = travels
      .filter((trip) => trip.status === TransferStatus.DELIVERED)
      .reduce((sum, trip) => sum + (trip.totalPrice || 0), 0);

    return {
      user,
      metrics: {
        assignedTrips,
        completedTrips,
        totalEarnings,
      },
    };
  }

  /**
   * Busca un usuario por ID (UUID)
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOneBy({
      id,
    } as unknown as FindOptionsWhere<User>);
    if (!user)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return user;
  }

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOneBy({
      email,
    } as unknown as FindOptionsWhere<User>);
    if (!user)
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    return user;
  }

  /* Busca un usuario por rol */

  async findByRole(role: any): Promise<User[]> {
    return this.userRepo.find({ where: { role } });
  }

  /**
   * Actualiza datos de usuario, incluyendo nested contactInfo y contraseña opcional
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Update user id=${id}`);
    const user = await this.findOne(id);
    if (updateUserDto.userType) {
      user.role = mapRawUserTypeToRole(updateUserDto.userType);
    }

    this.logger.debug(`Update payload: ${JSON.stringify(updateUserDto ?? {})}`);

    // Merge nested contactInfo
    if (updateUserDto.contactInfo) {
      const ci = { ...user.contactInfo, ...updateUserDto.contactInfo } as any;
      if (ci.documentId) {
        ci.documentId = normalizeId(ci.documentId);
        const kind = classifyId(ci.documentId);
        ci.documentType = kind;
        if (kind === 'DNI' && !validateDni(ci.documentId)) throw new BadRequestException('DNI inválido');
        if (kind === 'NIE' && !validateNie(ci.documentId)) throw new BadRequestException('NIE inválido');
      }
      user.contactInfo = ci;
      // recalcular accountType sin cambiar roles/permisos
      user.accountType = (ci?.companyName && String(ci.companyName).trim().length > 0)
        ? UserAccountType.COMPANY
        : (ci.documentType === 'CIF' || isLikelyCompanyName(ci.fullName) || isLikelyCompanyName(ci.companyName))
          ? UserAccountType.COMPANY
          : UserAccountType.PERSON;
    }

    // Asigna otros campos
    const { password, contactInfo, ...rest } = updateUserDto as any;
    Object.assign(user, rest);

    // Si se está promoviendo a DROVER y no tenía employmentType, asignar default
    if (user.role === 'DROVER' && !user.employmentType) {
      user.employmentType = DroverEmploymentType.FREELANCE;
    }

    const saved = await this.userRepo.save(user);
    this.logger.log(`User updated id=${id}`);
    return saved;
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async sendResetCode(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    const code = randomBytes(3).toString('hex');
    user.verificationCode = code;
    user.codeExpiresAt = new Date(Date.now() + 15 * 60_000);
    await this.userRepo.save(user);
    const url = 'https://drove.com/reset-password/' + code;
    await this.resend.sendPasswordResetEmail(
      email,
      user.contactInfo.fullName,
      url,
    );
  }

  async resetPassword(dto): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { verificationCode: dto.code },
    });
    if (
      user?.verificationCode !== dto.code ||
      !user?.codeExpiresAt ||
      user?.codeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Código inválido o expirado');
    }
    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.verificationCode = null;
    user.codeExpiresAt = null;
    await this.userRepo.save(user);
  }

  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  async updateCurrentPosition(userId: string, lat: number, lng: number) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.currentLat = typeof lat === 'number' ? lat : null;
    user.currentLng = typeof lng === 'number' ? lng : null;
    user.currentPositionUpdatedAt = new Date();
    await this.userRepo.save(user);
    return { ok: true };
  }

  /**
   * Elimina un usuario
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }
}
