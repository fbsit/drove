// src/user/user.service.ts (o en un helper aparte si prefieres)
import { UserRole } from './../user/entities/user.entity';
import { RawUserType } from './../user/dtos/createUser.dto';

export function mapRawUserTypeToRole(raw: RawUserType | undefined): UserRole {
  console.log('raw', raw);
  switch (raw?.toLowerCase()) {
    case 'drover': // o 'drover' si cambiaste el término
      return UserRole.DROVER;
    case 'admin':
      return UserRole.ADMIN;
    default:
      return UserRole.CLIENT; // client | undefined
  }
}
