import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Review } from './entity/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { User } from '../user/entities/user.entity';
import { Travels } from '../travels/entities/travel.entity';
import { ResendModule } from '../resend/resend.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Travels]), ResendModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
