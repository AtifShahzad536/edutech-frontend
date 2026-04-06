import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'instructor' | 'admin')[];
  requireAuth?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const router = useRouter();
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) return;

    // Direct access to login/signup doesn't require auth guard usually
    // handle logic if needed
    if (!requireAuth) return;

    if (!token) {
      router.push('/login');
      return;
    }

    if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to their respective dashboard if they are in the wrong place
      const dashboardMap: Record<string, string> = {
        student: '/student/dashboard',
        instructor: '/instructor/dashboard',
        admin: '/admin/dashboard',
      };
      router.push(dashboardMap[user.role] || '/');
    }
  }, [isInitialized, token, user, allowedRoles, requireAuth, router]);

  // Show loading while initializing or during redirects
  if (!isInitialized || (requireAuth && !token) || (requireAuth && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default RoleGuard;
