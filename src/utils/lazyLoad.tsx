import dynamic, { type DynamicOptionsLoadingProps } from 'next/dynamic';
import React, { ComponentType } from 'react';

// Generic lazy loading wrapper with loading component
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const loadingComponent = (
    _props: DynamicOptionsLoadingProps
  ): JSX.Element | null => {
    if (fallback) {
      const Fallback = fallback;
      return <Fallback />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  };

  return dynamic(importFunc, {
    loading: loadingComponent,
    ssr: false, // Disable server-side rendering for better performance
  });
};

// Preload components for better UX
export const preloadComponent = (importFunc: () => Promise<{ default: any }>) => {
  importFunc();
};

// Lazy loaded components with custom loading states
export const LazyCourseCard = lazyLoad(() => import('@/components/cards/CourseCard'));
export const LazyModal = lazyLoad(() => import('@/components/ui/Modal'));
export const LazyToast = lazyLoad(() => import('@/components/ui/Toast'));

// Lazy loaded pages
export const LazyStudentDashboard = lazyLoad(() => import('@/pages/student/dashboard'));
export const LazyInstructorDashboard = lazyLoad(() => import('@/pages/instructor/dashboard'));
export const LazyAdminDashboard = lazyLoad(() => import('@/pages/admin/dashboard'));
export const LazyCoursesPage = lazyLoad(() => import('@/pages/student/courses'));
export const LazyAssignmentsPage = lazyLoad(() => import('@/pages/student/assignments'));
export const LazyInstructorCourses = lazyLoad(() => import('@/pages/instructor/courses'));
export const LazyCreateCourse = lazyLoad(() => import('@/pages/instructor/create-course'));
export const LazyAdminUsers = lazyLoad(() => import('@/pages/admin/users'));

// Intersection Observer for lazy loading components
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, callback, options]);
};

// Lazy loading for images
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}> = ({ src, alt, className, fallback }) => {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useIntersectionObserver(
    imgRef,
    () => {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setImageSrc(fallback || '/placeholder.jpg');
        setIsLoading(false);
      };
      img.src = src;
    },
    { threshold: 0.1 }
  );

  return (
    <div ref={imgRef} className={className}>
      {isLoading && (
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'hidden' : ''}`}
        />
      )}
    </div>
  );
};

// Virtual scrolling helper for large lists
export const useVirtualScroll = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = React.useMemo(() => {
    return items.slice(visibleStart, visibleEnd).map((item, index) => ({
      item,
      index: visibleStart + index,
    }));
  }, [items, visibleStart, visibleEnd]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    offsetY: visibleStart * itemHeight,
  };
};

