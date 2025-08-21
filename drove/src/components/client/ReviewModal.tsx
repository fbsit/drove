
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: string;
  droverName: string;
  onReviewSubmitted: (review: { rating: number; comment: string }) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  transferId,
  droverName,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) return;
    
    onReviewSubmitted({ rating, comment });
    
    // Reset form
    setRating(0);
    setComment('');
    onClose();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Muy insatisfecho';
      case 2: return 'Insatisfecho';
      case 3: return 'Neutral';
      case 4: return 'Satisfecho';
      case 5: return 'Muy satisfecho';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#22142A] font-bold text-lg">
              Califica tu experiencia
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-auto p-1 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-[#22142A] mb-2">
              ¿Cómo fue tu experiencia con <span className="font-semibold">{droverName}</span>?
            </p>
            <p className="text-sm text-gray-600">
              Traslado #{transferId}
            </p>
          </div>

          {/* Rating stars */}
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          {/* Rating text */}
          {(hoveredRating || rating) > 0 && (
            <p className="text-center text-[#22142A] font-medium">
              {getRatingText(hoveredRating || rating)}
            </p>
          )}

          {/* Comment textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#22142A]">
              Cuéntanos sobre tu experiencia
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              rows={4}
              maxLength={500}
              className="resize-none bg-white border-gray-300 text-[#22142A] placeholder-gray-500 focus:border-[#6EF7FF] focus:ring-[#6EF7FF]"
            />
            <div className="text-right text-xs text-gray-500">
              {comment.length}/500
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-[#22142A] hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1 bg-[#6EF7FF] text-[#22142A] hover:bg-[#32dfff] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} className="mr-2" />
              Enviar reseña
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
