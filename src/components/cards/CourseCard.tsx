import React, { memo, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { FiClock, FiUsers, FiStar, FiBookOpen } from 'react-icons/fi';
import { Course } from '@/types';
import Button from '@/components/ui/Button';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  showEnrollButton?: boolean;
  variant?: 'default' | 'compact';
}

const CourseCard: React.FC<CourseCardProps> = memo(({ course, onEnroll, showEnrollButton = true, variant = 'default' }) => {
  const handleEnroll = useCallback(() => {
    onEnroll?.(course.id);
  }, [onEnroll, course.id]);

  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={clsx(
          'h-4 w-4',
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  }, []);

  const compactContent = useMemo(() => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <FiBookOpen className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 mb-1">{course.instructor?.firstName || 'Instructor'} {course.instructor?.lastName || ''}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <FiClock className="h-4 w-4 mr-1" />
              {course.duration}min
            </div>
            <div className="flex items-center">
              <FiUsers className="h-4 w-4 mr-1" />
              {course.studentsCount}
            </div>
            <div className="flex items-center">
              {renderStars(course.rating)}
              <span className="ml-1">({course.reviewsCount})</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          <div className="text-lg font-semibold text-gray-900">
            ${course.price}
          </div>
          {showEnrollButton && (
            <Button
              size="sm"
              onClick={handleEnroll}
              className="mt-2"
            >
              Enroll
            </Button>
          )}
        </div>
      </div>
    </div>
  ), [course, showEnrollButton, handleEnroll, renderStars]);

  const defaultContent = useMemo(() => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <FiBookOpen className="h-16 w-16 text-gray-400" />
        </div>
        {(course as any).isPreview && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            Preview
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {course.description}
          </p>
          <p className="text-sm text-gray-500">
            {course.instructor?.firstName || 'Instructor'} {course.instructor?.lastName || ''}
          </p>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <FiClock className="h-4 w-4 mr-1" />
              {course.duration}min
            </div>
            <div className="flex items-center">
              <FiUsers className="h-4 w-4 mr-1" />
              {course.studentsCount}
            </div>
            <div className="flex items-center">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {course.level}
              </span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {renderStars(course.rating)}
            <span className="ml-2 text-sm text-gray-600">
              {course.rating} ({course.reviewsCount} reviews)
            </span>
          </div>
        </div>

        {/* Price and Enroll */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ${course.price}
          </div>
          {showEnrollButton && (
            <Button
              onClick={handleEnroll}
              className="flex-shrink-0"
            >
              Enroll Now
            </Button>
          )}
        </div>
      </div>
    </div>
  ), [course, showEnrollButton, handleEnroll, renderStars]);

  return variant === 'compact' ? compactContent : defaultContent;
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
export { CourseCard };
