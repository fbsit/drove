import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
@Controller('reviews')
@ApiTags('Reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las reseñas (requiere auth)' })
  @Get()
  async getAllReviews(@Req() req) {
    return this.reviewsService.getAll();
  }
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear reseña (requiere auth)' })
  @ApiBody({ type: CreateReviewDto })
  @Post()
  async createReview(@Body() dto: CreateReviewDto, @Req() req) {
    const clientId = req.user.id; // Asume un AuthGuard que agrega req.user
    return this.reviewsService.create(clientId, dto);
  }

  @ApiOperation({ summary: 'Obtener reseña por viaje' })
  @ApiParam({ name: 'travelId', description: 'ID del viaje' })
  @Get('travel/:travelId')
  async getByTravel(@Param('travelId') travelId: string) {
    return this.reviewsService.findByTravel(travelId);
  }

  @ApiOperation({ summary: 'Obtener reseñas de un drover' })
  @ApiParam({ name: 'id', description: 'ID del drover' })
  @Get('drover/:id')
  async getReviews(@Param('id') droverId: string) {
    return this.reviewsService.findByDrover(droverId);
  }

  @ApiOperation({ summary: 'Obtener promedio de rating de un drover' })
  @ApiParam({ name: 'id', description: 'ID del drover' })
  @Get('drover/:id/average')
  async getAverage(@Param('id') droverId: string) {
    return this.reviewsService.getAverageRating(droverId);
  }
}
