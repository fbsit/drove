// src/verifications/verifications.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationsController } from './verifications.controller';
import { EmailVerificationService } from './verifications.service';
import { User } from '../user/entities/user.entity'; // ← your User entity
import { UserModule } from '../user/user.module'; // ← module that exports the repository
import { ResendModule } from '../resend/resend.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // make UserRepository injectable
    forwardRef(() => UserModule), // if UsersModule also needs VerificationsModule
    ResendModule,
    NotificationsModule,
  ],
  controllers: [VerificationsController],
  providers: [
    EmailVerificationService,
  ],
  exports: [EmailVerificationService],
})
export class VerificationsModule {}
