import React from 'react';
import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
  rating: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, className = "" }) => (
  <div className={`flex items-center gap-0.5 ${className}`}>
    {[1, 2, 3, 4, 5].map(i => (
      <FiStar 
        key={i} 
        className={`h-3 w-3 ${i <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
      />
    ))}
  </div>
);

export default StarRating;
