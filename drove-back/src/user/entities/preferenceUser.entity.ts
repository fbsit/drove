import {
  Entity,
  Column,
  PrimaryColumn
} from 'typeorm';
import { User } from './user.entity';
import { IsOptional, IsObject } from 'class-validator';
// entity
@Entity('user_preferences')
export class UserPreferences {
  @PrimaryColumn('uuid')
  userId: string;

  /** JSON con todas las opciones */
  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;
}

// dto/update-preferences.dto.ts
export class UpdatePreferencesDto {
  @IsObject()
  @IsOptional()
  email?: {
    newTransfers?: boolean;
    droverUpdates?: boolean;
    paymentAlerts?: boolean;
    systemUpdates?: boolean;
    weeklyReports?: boolean;
  };

  @IsObject()
  @IsOptional()
  push?: {
    urgentAlerts?: boolean;
    newSignups?: boolean;
    transfersCompleted?: boolean;
    lowBalance?: boolean;
  };

  @IsObject()
  @IsOptional()
  dashboard?: {
    realtimeUpdates?: boolean;
    soundFx?: boolean;
    popupNotifications?: boolean;
  };

  @IsObject()
  @IsOptional()
  profile?: {
    showOnline?: boolean;
    searchable?: boolean;
    showRecentActivity?: boolean;
  };

  @IsObject()
  @IsOptional()
  dataUsage?: {
    shareAnalytics?: boolean;
    allowNonEssentialCookies?: boolean;
    extendedRetention?: boolean;
  };

  @IsObject()
  @IsOptional()
  security?: {
    twoFactorAuth?: boolean;
    loginAlerts?: boolean;
    autoLogout?: boolean;
  };
}
