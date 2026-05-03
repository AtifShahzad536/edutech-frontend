import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { useRouter } from 'next/router';
import { 
  FiBell, FiX, FiCheck, FiInfo, FiZap, FiTrash2, FiChevronDown, FiCheckCircle 
} from 'react-icons/fi';
import { 
  fetchNotifications, markAsRead, clearAll, 
  selectUnreadNotificationsCount 
} from '@/store/slices/notificationSlice';
import { RootState } from '@/store';

// Simple native helper
const formatTimeAgo = (date: Date) => {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
};

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications = [], loading = false } = useAppSelector((state: RootState) => state.notifications || {});
  const { user, isInitialized, token } = useAppSelector((state: RootState) => state.auth);
  
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  useEffect(() => {
    if (isInitialized && token) {
      dispatch(fetchNotifications());
    }
  }, [isInitialized, token, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all border ${
          isOpen 
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' 
            : 'bg-gray-950 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
        }`}
      >
        <FiBell className={`h-5 w-5 ${isOpen ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-gray-950 animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-gray-950 rounded-2xl border border-white/10 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Notifications</h3>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-none">Activity Center</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => dispatch(fetchNotifications())}
                className="p-2 hover:bg-white/5 text-gray-600 hover:text-white rounded-lg transition-all"
                title="Refresh"
              >
                <FiZap className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
               <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500" />
               </div>
            ) : notifications.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <FiZap className="h-10 w-10 text-gray-900 mx-auto" />
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest leading-tight">No Notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => dispatch(markAsRead(n._id))}
                    className={`p-5 hover:bg-white/[0.03] transition-colors cursor-pointer group relative ${!n.isRead ? 'bg-indigo-500/[0.03]' : ''}`}
                  >
                    {!n.isRead && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-lg shadow-indigo-500/40" />}
                    
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-110 ${getColor(n.type)}`}>
                        <FiInfo className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-[10px] font-black uppercase tracking-widest truncate ${!n.isRead ? 'text-white' : 'text-gray-500'}`}>
                            {n.title}
                          </p>
                          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest shrink-0">
                            {formatTimeAgo(new Date(n.createdAt))}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-black/40 border-t border-white/5">
            <button 
              onClick={() => {
                const role = user?.role || 'student';
                router.push(`/${role}/notifications`);
                setIsOpen(false);
              }}
              className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
