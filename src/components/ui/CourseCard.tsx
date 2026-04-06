import React from 'react';
import Link from 'next/link';
import { FiClock, FiUsers, FiTrendingUp, FiLayers, FiCheckCircle } from 'react-icons/fi';
import StarRating from './StarRating';

interface CourseCardProps {
  id: string | number;
  title: string;
  description?: string;
  thumbnail?: string;
  category: string;
  level: string;
  instructor: string;
  rating?: number;
  studentsCount?: string | number;
  duration?: string;
  price?: string | number;
  originalPrice?: string | number;
  progress?: number;
  status?: 'completed' | 'ongoing';
  isEnrolled?: boolean;
  isInCart?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  href?: string;
  variant?: 'grid' | 'list';
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  category,
  level,
  instructor,
  rating = 0,
  studentsCount = 0,
  duration,
  price,
  originalPrice,
  progress,
  status,
  isEnrolled,
  isInCart,
  onAction,
  actionLabel = "View Course",
  actionIcon,
  secondaryAction,
  href = "/courses",
  variant = 'grid'
}) => {
  const isFree = price === 0 || price === '0' || price === 'Free' || price === '$0.00';
  
  const content = (
    <div className={`group bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:shadow-2xl transition-all duration-500 flex ${variant === 'list' ? 'flex-row' : 'flex-col'} h-full shadow-2xl`}>
      {/* Thumbnail Area */}
      <div className={`relative overflow-hidden shrink-0 ${variant === 'list' ? 'w-64 h-auto' : 'aspect-[16/10]'}`}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 relative z-10"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
            <FiLayers className="h-16 w-16 text-white" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-20">
          {isFree && (
            <span className="bg-emerald-600/90 backdrop-blur text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
              Free
            </span>
          )}
          {isEnrolled && (
            <span className="bg-indigo-600/90 backdrop-blur text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <FiCheckCircle className="h-2.5 w-2.5" /> Enrolled
            </span>
          )}
          {status === 'completed' && (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">
              Completed
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-black/50 backdrop-blur border border-white/10 text-gray-300 text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
            {level}
          </span>
        </div>

        {/* Progress Bar (if available) */}
        {typeof progress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 border-t border-white/5 overflow-hidden z-20">
            <div
              className={`h-full transition-all duration-1000 ${status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="space-y-3 mb-6">
          <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">{category}</p>
          <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-1 min-h-[1.25em]">
            {title}
          </h3>
          <p className="text-[13px] text-gray-500 font-medium line-clamp-2 leading-relaxed min-h-[3em]">
            {description || "Start your professional journey with this expert-led course today."}
          </p>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide leading-none pt-1">
            by <span className="text-gray-400">{instructor}</span>
          </p>
        </div>

        <div className="mt-auto space-y-4">
          {/* Meta row */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 pt-3 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-400">
                <StarRating rating={rating} />
                <span className="text-white ml-0.5">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiUsers className="h-3 w-3 text-gray-600" />
                <span>{studentsCount.toLocaleString()}</span>
              </div>
            </div>
            {duration && (
              <div className="flex items-center gap-1 text-gray-600">
                <FiClock className="h-3 w-3" />
                <span>{duration}</span>
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-indigo-400/50 uppercase tracking-[0.2em] font-black leading-none mb-1.5">
                {typeof progress === 'number' ? 'Completion' : 'Tuition'}
              </span>
              <div className="flex items-center gap-2 leading-none">
                {typeof progress === 'number' ? (
                  <span className={`text-xl font-black tracking-tight ${status === 'completed' ? 'text-emerald-500' : 'text-white'}`}>
                    {progress}%
                  </span>
                ) : (
                  <>
                    <span className="text-xl font-black text-white tracking-tight">
                      {isFree ? 'Free' : price}
                    </span>
                    {originalPrice && (
                      <span className="text-[10px] text-gray-700 line-through font-bold">{originalPrice}</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {onAction ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAction();
                }}
                className={`px-5 py-3 rounded-xl font-medium uppercase tracking-widest text-[9px] transition-all shadow-xl active:scale-95 flex items-center gap-2 whitespace-nowrap ${
                  isEnrolled && !status
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20'
                    : isInCart
                    ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400'
                    : status === 'completed'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-white hover:bg-gray-100 text-black'
                }`}
              >
                {actionIcon}
                {actionLabel}
              </button>
            ) : (
              secondaryAction
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : content;
};

export default CourseCard;
