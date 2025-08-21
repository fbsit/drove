// src/user/dtos/create-user.dto.ts
import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ContactInfoDto } from './contact-info.dto';

/** Roles válidos que vienen en minúsculas desde el cliente */
export type RawUserType = 'client' | 'driver' | 'admin';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail() email: string;
  @ApiProperty({ example: 'MyS3cret123' })
  @IsString() password: string;

  /** `"client" | "driver" | "admin"` → lo convertirás a tu enum UserRole en el service */
  @ApiProperty({ enum: ['client', 'driver', 'admin'] })
  @IsString() userType: RawUserType;

  /** Datos anidados */
  @ApiProperty({ type: () => ContactInfoDto })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;
}
