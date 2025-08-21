// src/verifications/verifications.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationsController } from './verifications.controller';
import { EmailVerificationService } from './verifications.service';
import { User } from '../user/entities/user.entity'; // ← your User entity
import { UserModule } from '../user/user.module'; // ← module that exports the repository
import { ResendService } from '../resend/resend.service'; // ← wherever you define it

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // make UserRepository injectable
    forwardRef(() => UserModule), // if UsersModule also needs VerificationsModule
  ],
  controllers: [VerificationsController],
  providers: [
    EmailVerificationService,
    ResendService, // register ResendService
  ],
  exports: [EmailVerificationService],
})
export class VerificationsModule {}
