import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto, RawUserType } from './createUser.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DroverEmploymentType } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  userType?: RawUserType;

  // Permitir actualizar solamente el tipo de relación laboral del drover
  @IsOptional()
  @IsEnum(DroverEmploymentType)
  employmentType?: DroverEmploymentType;
}
