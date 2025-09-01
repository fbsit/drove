
import React, { useState } from "react";
import { useReviewsManagement } from "@/hooks/admin/useReviewsManagement";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { Loader2, Star, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

const Reviews: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("todas");
  const [drover, setDrover] = useState("todos");
  const [responseFilter, setResponseFilter] = useState("todas");

  const debouncedSearch = useDebouncedValue(search, 300);

  const {
    reviews,
    drovers,
    isLoading,
    respondToReview,
    markAsViewed,
    isResponding,
    isMarkingAsViewed
  } = useReviewsManagement({ search: debouncedSearch, rating: ratingFilter, drover, responded: responseFilter });

  // Server-side (a futuro) o fuente ya filtrada por queryKey. Mostramos lo recibido
  const filteredReviews = reviews;

  // Calcular estadísticas
  const stats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0",
    pendingResponses: reviews.filter(r => !r.adminResponse).length,
    last30Days: reviews.filter(r => {
      const reviewDate = new Date(r.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return reviewDate >= thirtyDaysAgo;
    }).length
  };

  const handleRespond = (reviewId: string) => {
    const response = prompt("Escribe tu respuesta:");
    if (response) {
      respondToReview(reviewId, response);
    }
  };

  const handleMarkAsViewed = (reviewId: string) => {
    markAsViewed(reviewId);
  };

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#6EF7FF]" />
          <span className="ml-2 text-white">Cargando reseñas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="mb-6">
        <h1 className="text-2xl text-white mb-1" style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
          Gestión de Reseñas
        </h1>
        <p className="text-white/70">
          Administra las reseñas de los clientes, responde a comentarios y supervisa la calidad del servicio.
        </p>

        {/* Estadísticas */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
            <div className="text-sm text-white/60">Total Reseñas</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#6EF7FF]">{stats.averageRating}</div>
            <div className="text-sm text-white/60">Rating Promedio</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingResponses}</div>
            <div className="text-sm text-white/60">Sin Responder</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.last30Days}</div>
            <div className="text-sm text-white/60">Últimos 30 días</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar reseñas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50"
        />
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full p-3 rounded-lg bg-[#1A1F2C] border border-white/20 text-white">
            <SelectValue placeholder="Todas las calificaciones" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todas">Todas las calificaciones</SelectItem>
              <SelectItem value="5">5 estrellas</SelectItem>
              <SelectItem value="4">4 estrellas</SelectItem>
              <SelectItem value="3">3 estrellas</SelectItem>
              <SelectItem value="2">2 estrellas</SelectItem>
              <SelectItem value="1">1 estrella</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={drover} onValueChange={setDrover}>
          <SelectTrigger className="w-full p-3 rounded-lg bg-[#1A1F2C] border border-white/20 text-white">
            <SelectValue placeholder="Todos los drovers" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todos">Todos los drovers</SelectItem>
              {drovers.map(d => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={responseFilter} onValueChange={setResponseFilter}>
          <SelectTrigger className="w-full p-3 rounded-lg bg-[#1A1F2C] border border-white/20 text-white">
            <SelectValue placeholder="Todas las respuestas" />
          </SelectTrigger>
          <SelectContent className="bg-[#22142A] text-white border-white/10 z-30">
            <SelectGroup>
              <SelectItem value="todas">Todas las respuestas</SelectItem>
              <SelectItem value="respondidas">Respondidas</SelectItem>
              <SelectItem value="sin_responder">Sin responder</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white font-bold">{review.clientName}</h3>
                <p className="text-white/70">Drover: {review.droverName}</p>
                <p className="text-white/60 text-sm">Traslado #{review.transferId}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                      }`}
                  />
                ))}
                <span className="ml-2 text-white">{review.rating}/5</span>
              </div>
            </div>

            <p className="text-white/80 mb-4">{review.comment}</p>

            {review.adminResponse && (
              <div className="bg-white/5 rounded p-3 mb-4">
                <p className="text-white/70 text-sm mb-1">Respuesta del administrador:</p>
                <p className="text-white">{review.adminResponse}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleRespond(review.id)}
                disabled={isResponding}
                className="bg-[#6EF7FF] hover:bg-[#32dfff] text-[#22142A]"
              >
                {isResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-1" />}
                {review.adminResponse ? 'Actualizar Respuesta' : 'Responder'}
              </Button>

              {!review.isViewed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAsViewed(review.id)}
                  disabled={isMarkingAsViewed}
                >
                  {isMarkingAsViewed ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
                  Marcar como Vista
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No se encontraron reseñas</p>
          <p className="text-white/50 text-sm mt-2">
            Ajusta los filtros para encontrar las reseñas que buscas
          </p>
        </div>
      )}
    </div>
  );
};

export default Reviews;
