
import React from "react";
import { Star, User, Calendar, MessageSquare } from "lucide-react";
import { Review } from "@/types/review";
import { Button } from "@/components/ui/button";

interface ReviewCardProps {
  review: Review;
  onRespond: (reviewId: string) => void;
  onMarkAsViewed: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onRespond, onMarkAsViewed }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "nueva": return "bg-red-500";
      case "vista": return "bg-yellow-500";
      case "respondida": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "nueva": return "Nueva";
      case "vista": return "Vista";
      case "respondida": return "Respondida";
      default: return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
      />
    ));
  };

  return (
    <div className="bg-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6EF7FF]/20 rounded-full flex items-center justify-center">
            <User size={20} className="text-[#6EF7FF]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{review.clientName}</h3>
            <p className="text-white/60 text-sm">Drover: {review.droverName}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(review.status)}`}>
          {getStatusLabel(review.status)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
        </div>
        <span className="text-white font-semibold">{review.rating}/5</span>
      </div>

      <p className="text-white/90 mb-3 leading-relaxed">{review.comment}</p>

      <div className="flex items-center justify-between text-sm text-white/60 mb-3">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          {new Date(review.createdAt).toLocaleDateString('es-ES')}
        </div>
        <span>{review.transferRoute}</span>
      </div>

      {review.adminResponse && (
        <div className="bg-[#6EF7FF]/10 rounded-xl p-3 mb-3">
          <p className="text-[#6EF7FF] font-semibold text-sm mb-1">Respuesta del administrador:</p>
          <p className="text-white/90 text-sm">{review.adminResponse}</p>
        </div>
      )}

      <div className="flex gap-2">
        {review.status === "nueva" && (
          <Button
            size="sm"
            variant="ghost"
            className="text-[#6EF7FF] hover:bg-[#6EF7FF]/10"
            onClick={() => onMarkAsViewed(review.id)}
          >
            Marcar como vista
          </Button>
        )}
        {review.status !== "respondida" && (
          <Button
            size="sm"
            variant="ghost"
            className="text-green-400 hover:bg-green-400/10"
            onClick={() => onRespond(review.id)}
          >
            <MessageSquare size={16} />
            Responder
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
