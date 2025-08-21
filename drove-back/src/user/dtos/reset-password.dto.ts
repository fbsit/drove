import { IsEmail, IsString, MinLength } from 'class-validator';
export class ResetPasswordDto {
  @IsString()
  code: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
