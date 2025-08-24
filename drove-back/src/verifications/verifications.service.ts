import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ResendService } from '../resend/resend.service';

@Injectable()
export class EmailVerificationService {
  private readonly CODE_TTL = 10 * 60 * 1000; // 10 minutos

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly resend: ResendService,
  ) {}

  async sendVerificationCode(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return false;

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos unificado
    user.verificationCode = code;
    user.codeExpiresAt = new Date(Date.now() + this.CODE_TTL);
    await this.userRepo.save(user);

    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://drove.app';
    const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verifyEmail?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
    const name = user?.contactInfo?.fullName || email;
    await this.resend.sendEmailVerificationEmail(email, name, verifyUrl);

    return true;
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.verificationCode || !user.codeExpiresAt) return false;

    if (user.verificationCode !== code) return false;
    if (user.codeExpiresAt < new Date()) return false;

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.codeExpiresAt = undefined;
    await this.userRepo.save(user);
    return true;
  }
}
