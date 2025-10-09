import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { ResendService } from '../resend/resend.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EmailVerificationService {
  private readonly CODE_TTL = 10 * 60 * 1000; // 10 minutos

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly resend: ResendService,
    private readonly notifications: NotificationsService,
  ) {}

  async sendVerificationCode(email: string): Promise<boolean> {
    const normalized = String(email ?? '').trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalized } });
    if (!user) return false;

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos unificado
    user.verificationCode = code;
    user.codeExpiresAt = new Date(Date.now() + this.CODE_TTL);
    await this.userRepo.save(user);

    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.up.railway.app';
    const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verifyEmail?email=${encodeURIComponent(normalized)}&code=${encodeURIComponent(code)}`;
    const name = user?.contactInfo?.fullName || normalized;
    await this.resend.sendEmailVerificationEmail(normalized, name, verifyUrl);

    return true;
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const normalized = String(email ?? '').trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: normalized } });
    if (!user || !user.verificationCode || !user.codeExpiresAt) return false;

    if (user.verificationCode !== code) return false;
    if (user.codeExpiresAt < new Date()) return false;

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.codeExpiresAt = undefined;
    await this.userRepo.save(user);

    // Notificar a administradores para aprobar al nuevo usuario
    try {
      const admins = await this.userRepo.find({
        where: [
          { role: UserRole.ADMIN },
          { role: UserRole.TRAFFICBOSS },
        ],
        select: { email: true },
      });
      const recipients = admins.map(a => a.email).filter(Boolean);
      if (recipients.length) {
        const adminBase = process.env.ADMIN_BASE_URL || 'https://admin.drove.app';
        const base = adminBase.replace(/\/$/, '');
        const role = String(user.role || '').toUpperCase();
        // Enlace específico por tipo de usuario
        const approvalUrl = role === 'DROVER'
          ? `${base}/admin/drovers/${encodeURIComponent(user.id)}`
          : `${base}/admin/clients/${encodeURIComponent(user.id)}`;
        await this.resend.sendNewUserPendingApprovalEmail(
          recipients,
          user.email,
          user?.contactInfo?.fullName || '',
          user.role,
          approvalUrl,
        );
      }
      // Crear notificación global para administradores
      await this.notifications.create({
        title: 'Nuevo usuario verificado',
        message: `${user?.contactInfo?.fullName || user.email} está pendiente de aprobación`,
        roleTarget: UserRole.ADMIN,
        category: 'NEW_USER',
        entityType: 'USER',
        entityId: user.id,
        read: false,
        userId: null,
        data: { email: user.email, role: user.role },
      });
    } catch {}
    return true;
  }
}
