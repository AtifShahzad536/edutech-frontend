import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { FiBell, FiX, FiCheck, FiAlertCircle, FiInfo, FiAward, FiMessageSquare, FiCalendar, FiBookOpen, FiUser, FiZap, FiTrash2 } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'message' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<any>;
}

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token, isInitialized } = useAppSelector(state => state.auth);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isInitialized || !token) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          // Map backend format to frontend format
          const mapped = result.data.map((n: any) => ({
            id: n._id,
            type: n.type || 'system',
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt),
            read: n.isRead,
            icon: FiZap // Default icon for now
          }));
          setNotifications(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [isInitialized, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    // Optimization: we could call a backend endpoint to mark all read
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string, Icon?: any) => {
    if (Icon) return <Icon className="h-4 w-4" />;
    return <FiInfo className="h-4 w-4" />;
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'reminder': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'message': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all border ${
          isOpen ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' : 'bg-gray-950 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
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
        <div className="absolute right-0 mt-4 w-96 bg-gray-950 rounded-2xl border border-white/5 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Notifications</h3>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-none">System Updates</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} 
                className="p-2 hover:bg-white/5 text-gray-600 hover:text-white rounded-lg transition-all border border-transparent hover:border-white/5"
                title="Mark all read"
              >
                <FiCheck className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); clearAll(); }} 
                className="p-2 hover:bg-rose-500/10 text-gray-600 hover:text-rose-400 rounded-lg transition-all border border-transparent hover:border-rose-500/20"
                title="Clear all"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <FiZap className="h-10 w-10 text-gray-900 mx-auto" />
                <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest leading-tight">No Notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group relative ${!n.read ? 'bg-indigo-500/[0.02]' : ''}`}
                  >
                    {!n.read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-lg" />}
                    
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-110 ${getColor(n.type)}`}>
                        {getIcon(n.type, n.icon)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${!n.read ? 'text-white' : 'text-gray-500'}`}>
                            {n.title}
                          </p>
                          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            {Math.floor((Date.now() - n.timestamp.getTime()) / 60000)}m
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
          <div className="p-4 bg-black/20 border-t border-white/5">
            <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border border-white/5">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

