
import ApiService from './api';

export interface ReviewDTO {
  response: string;
}

/**
 * Servicio de Reseñas
 * Gestiona reseñas de drovers y administración
 */
export class ReviewService {
  
  /* GET /reviews - Obtener todas las reseñas (admin) */
  static async getAllReviews(): Promise<any[]> {
    return ApiService.get('/reviews');
  }

  /* GET /reviews/drover/:id - Obtener reseñas de un drover específico */
  static async getDroverReviews(droverId: string): Promise<any[]> {
    return ApiService.get(`/reviews/drover/${droverId}`);
  }

  /* GET /reviews/drover/:id/average - Obtener promedio de reseñas de un drover */
  static async getDroverAverageRating(droverId: string): Promise<any> {
    return ApiService.get(`/reviews/drover/${droverId}/average`);
  }

  /* POST /reviews/{id}/respond - Responder a una reseña */
  static async respondToReview(reviewId: string, dto: ReviewDTO): Promise<any> {
    // No existe en backend; opcionalmente podrías eliminar esta acción del UI o implementar endpoint.
    // Por ahora devolvemos error explícito.
    throw new Error('Responder a reseña no está soportado por el backend actual');
  }

  /* POST /reviews/{id}/viewed - Marcar reseña como vista */
  static async markReviewAsViewed(reviewId: string): Promise<any> {
    // No existe en backend
    throw new Error('Marcar reseña como vista no está soportado por el backend actual');
  }

  /* POST /reviews - Crear nueva reseña */
  static async createReview(reviewData: any): Promise<any> {
    return ApiService.post('/reviews', reviewData);
  }
}

export default ReviewService;
