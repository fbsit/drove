import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserPreferences } from './entities/preferenceUser.entity'; // 👈
import { UserController } from './user.controller';
import { PreferencesController } from './userPreference.controller';
import { UserService } from './user.service';
import { PreferenceService } from './userPreference.service';
import { Travels } from '../travels/entities/travel.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    // registra ambos repositorios
    TypeOrmModule.forFeature([User, UserPreferences, Travels]),
    NotificationsModule,
  ],
  controllers: [UserController, PreferencesController],
  providers: [UserService, PreferenceService],
  exports: [UserService, PreferenceService], // exporta si lo necesitas fuera
})
export class UserModule {}
