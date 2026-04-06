import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setUser, setToken, setInitialized } from '@/store/slices/authSlice';

// Hook to sync auth state from localStorage on client side mount
export const useAuthSync = () => {
  const dispatch = useAppDispatch();
  const hydrated = useRef(false);

  useEffect(() => {
    // Only run on client side once
    if (typeof window !== 'undefined' && !hydrated.current) {
      hydrated.current = true;
      // Restore token and user from localStorage on mount
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch(setUser(parsedUser));
          dispatch(setToken(storedToken));
        } catch (error) {
          console.warn('Failed to parse stored user data:', error);
          // Clear corrupted data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      dispatch(setInitialized(true));
    }
  }, [dispatch]);
};
