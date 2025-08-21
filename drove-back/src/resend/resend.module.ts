// src/resend/resend.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResendService } from './resend.service';
import { ResendController } from './resend.controller';

/**
 * Marcamos el módulo como `@Global` para poder inyectar ResendService
 * desde cualquier otro módulo sin volver a importarlo.
 * (Si no lo necesitas global, quita el decorador @Global)
 */
@Global()
@Module({
  imports: [ConfigModule], // Para leer ENV vars
  providers: [ResendService],
  controllers: [ResendController],
  exports: [ResendService], // Para usar el servicio en otros módulos
})
export class ResendModule {}
