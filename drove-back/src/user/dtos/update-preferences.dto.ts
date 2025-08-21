import { IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePreferencesDto {
  @IsOptional() @IsObject()
  email?: {
    newTransfers?: boolean;
    droverUpdates?: boolean;
    paymentAlerts?: boolean;
    systemUpdates?: boolean;
    weeklyReports?: boolean;
  };

  @IsOptional() @IsObject()
  push?: {
    urgentAlerts?: boolean;
    newSignups?: boolean;
    transfersCompleted?: boolean;
    lowBalance?: boolean;
  };

  // …añade el resto de grupos (dashboard, profile, etc.) de igual forma
}
