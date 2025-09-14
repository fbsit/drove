import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../user/entities/user.entity';
import { Travels } from '../travels/entities/travel.entity';
import { ResendService } from '../resend/resend.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Travels)
    private readonly travelsRepo: Repository<Travels>,
    private readonly resend: ResendService,
  ) {}

  async findByTravel(travelId: string): Promise<Review | null> {
    const existing = await this.reviewRepo.findOne({ where: { travelId } });
    return existing ?? null;
  }

  async create(clientId: string, dto: CreateReviewDto): Promise<Review> {
    const travel = await this.travelsRepo.findOne({
      where: { id: dto.travelId },
    });
    if (!travel) throw new NotFoundException('Viaje no encontrado');
    if (travel.idClient !== clientId)
      throw new ForbiddenException('No eres cliente de este viaje');
    if (!travel.droverId)
      throw new BadRequestException('Viaje sin drover asignado');

    // Evitar reseñas duplicadas por viaje
    const already = await this.reviewRepo.findOne({ where: { travelId: dto.travelId } });
    if (already) throw new BadRequestException('Ya existe una reseña para este viaje');

    const review = this.reviewRepo.create({
      clientId,
      droverId: travel.droverId,
      travelId: dto.travelId,
      rating: dto.rating,
      comment: dto.comment,
    });
    const droverInfo = await this.userRepo.findOne({
      where: { id: travel.droverId },
    });
    const clientInfo = await this.userRepo.findOne({
      where: { id: travel.idClient },
    });
    await this.resend.sendReviewReceivedEmail(
      droverInfo?.email ?? 'No informado',
      droverInfo?.contactInfo.fullName ?? 'Drover no informado',
      new Date().toLocaleDateString('es-ES'),
      travel.typeVehicle ?? 'Vehículo no especificado',
      travel.startAddress.city,
      travel.endAddress.city,
      clientInfo?.contactInfo.fullName ?? 'Cliente no informado',
      review.rating,
      review.comment ?? 'Sin comentario',
    );
    return this.reviewRepo.save(review);
  }

  async getAll(): Promise<Review[]> {
    return this.reviewRepo.find();
  }

  async findByDrover(droverId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { droverId },
      order: { createdAt: 'DESC' },
      relations: ['client'],
    });
  }

  async getAverageRating(
    droverId: string,
  ): Promise<{ average: number; count: number }> {
    const [reviews, count] = await this.reviewRepo.findAndCount({
      where: { droverId },
    });
    const average =
      count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    return { average, count };
  }
}
