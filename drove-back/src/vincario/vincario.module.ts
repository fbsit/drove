import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { VincarioService } from './vincario.service';
import { VincarioController } from './vincario.controller';
import { VinDecodeVincario } from './entities/vin-decode-vincario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VinDecodeVincario]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 60,  // 60 requests per minute
    }]),
  ],
  controllers: [VincarioController],
  providers: [VincarioService],
  exports: [VincarioService],
})
export class VincarioModule {}
