import React from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = "h-6 w-6" }) => {
  return (
    <div className="flex items-center justify-center space-x-1 space-x-reverse">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating && setRating(star)}
          className={`cursor-${setRating ? 'pointer' : 'default'} text-gray-300 transition-colors ${rating >= star ? 'text-yellow-400' : ''}`}
          disabled={!setRating}
        >
          <StarIcon className={size} filled={rating >= star} />
        </button>
      ))}
    </div>
  );
};

export default StarRating;