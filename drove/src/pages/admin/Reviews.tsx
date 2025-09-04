
import React, { useMemo, useState } from "react";
import { useReviewsManagement } from "@/hooks/admin/useReviewsManagement";
import { useDebouncedValue } from "@/hooks/useDebounce";
import { Loader2, Star, MessageSquare, Users } from "lucide-react";
import ReviewFilters from "@/components/admin/reviews/ReviewFilters";
import ReviewCard from "@/components/admin/reviews/ReviewCard";

const Reviews: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("todas");
  const [droverFilter, setDroverFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  const debouncedSearch = useDebouncedValue(search, 300);

  const { 
    reviews, 
    drovers, 
    isLoading, 
    respondToReview, 
    markAsViewed,
  } = useReviewsManagement({ search: debouncedSearch, rating: ratingFilter, drover: droverFilter, responded: statusFilter });

  // Filtro local según figma (search, rating, estado, drover)
  const filteredReviews = useMemo(() => {
    const term = (search || "").toLowerCase();
    return (reviews || []).filter((r: any) => {
      const matchesSearch = !term ||
        r.clientName?.toLowerCase().includes(term) ||
        r.comment?.toLowerCase().includes(term) ||
        r.droverName?.toLowerCase().includes(term);
      const matchesRating = ratingFilter === "todas" || Number(r.rating) === Number(ratingFilter);
      const matchesStatus = statusFilter === "todos" || r.status === statusFilter;
      const matchesDrover = droverFilter === "todos" || r.droverName === droverFilter;
      return matchesSearch && matchesRating && matchesStatus && matchesDrover;
    });
  }, [reviews, search, ratingFilter, statusFilter, droverFilter]);

  // Estadísticas (como en figma)
  const stats = {
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
      : "0.0",
    newReviews: (reviews || []).filter((r: any) => r.status === 'nueva').length,
    totalReviews: (reviews || []).length,
  };

  const handleRespond = (reviewId: string) => {
    const response = prompt("Escribe tu respuesta:");
    if (response) {
      // La API actual es placeholder; mostrará un toast de no disponible
      // Conservamos la llamada para mantener la UX.
      (respondToReview as any)({ reviewId, response });
    }
  };

  const handleMarkAsViewed = (reviewId: string) => {
    (markAsViewed as any)(reviewId);
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
      {/* Hero gradient header */}
      <section
        className="
          w-full
          flex flex-col items-center justify-center text-center
          bg-gradient-to-tr from-[#292244] via-[#242b36] to-[#191428] 
          rounded-2xl
          border border-[#6EF7FF33]
          px-4 py-6 mb-5
          shadow-[0_2px_32px_0_#6EF7FF11]
          md:rounded-2xl md:py-8 md:px-8
          md:flex-row md:items-end md:text-left md:mb-6
        "
        style={{ minHeight: 120 }}
      >
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h1
            className="
              text-xl md:text-2xl text-white font-bold mb-2
              tracking-tight
              leading-tight
              drop-shadow-[0_4px_12px_rgba(110,247,255,0.18)]
            "
          >
            Gestión de Reseñas
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-md font-normal mb-0 leading-snug">
            Administra y responde a las reseñas de los clientes. Mantén la calidad del servicio.
          </p>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <Star className="text-yellow-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Valoración Media</p>
              <p className="text-white text-2xl font-bold">{stats.averageRating}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <MessageSquare className="text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Reseñas Nuevas</p>
              <p className="text-white text-2xl font-bold">{stats.newReviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6EF7FF]/20 rounded-xl">
              <Users className="text-[#6EF7FF]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Reseñas</p>
              <p className="text-white text-2xl font-bold">{stats.totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      <ReviewFilters
        search={search}
        setSearch={setSearch}
        filterRating={ratingFilter}
        setFilterRating={setRatingFilter}
        filterStatus={statusFilter}
        setFilterStatus={setStatusFilter}
        filterDrover={droverFilter}
        setFilterDrover={setDroverFilter}
        drovers={(drovers || []).map((d: any) => d.name)}
      />

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReviews.map((review: any) => (
          <ReviewCard
            key={review.id}
            review={review}
            onRespond={handleRespond}
            onMarkAsViewed={handleMarkAsViewed}
          />
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg">No se encontraron reseñas</p>
          <p className="text-white/50 text-sm mt-2">Ajusta los filtros para encontrar las reseñas que buscas</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;
