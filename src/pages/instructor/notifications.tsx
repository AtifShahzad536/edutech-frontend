import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiBell, FiCheck, FiX, FiCheckCircle, FiTrash2, FiZap, 
  FiAward, FiBook, FiMessageSquare, FiCalendar, FiActivity, FiInfo
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthenticatedPage } from '@/types';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchNotifications, markAsRead, deleteNotification } from '@/store/slices/notificationSlice';
import toast from 'react-hot-toast';

// Simple native helper
const formatTimeAgo = (date: Date) => {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const InstructorNotificationsPage: AuthenticatedPage = () => {
  const dispatch = useAppDispatch();
  const { notifications = [], loading = false } = useAppSelector(state => state.notifications || {});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filteredNotifications = useMemo(() => {
    const list = notifications || [];
    if (filter === 'unread') return list.filter(n => !n.isRead);
    return list;
  }, [notifications, filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      toast.success('Notification removed');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <FiAward className="text-emerald-400" />;
      case 'info': return <FiBook className="text-indigo-400" />;
      case 'warning': return <FiActivity className="text-amber-400" />;
      default: return <FiInfo className="text-gray-400" />;
    }
  };

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <DashboardLayout title="Instructor Inbox">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Inbox</h1>
            <p className="text-sm text-gray-500 font-medium">You have {unreadCount} new messages</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {['all', 'unread'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilter(opt)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      filter === opt ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div 
                key={notif._id}
                className={`group relative flex items-start gap-5 p-6 rounded-3xl border transition-all duration-300 ${
                  notif.isRead 
                    ? 'bg-white/5 border-white/5 hover:bg-white/[0.07]' 
                    : 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 shadow-xl shadow-indigo-500/5'
                }`}
              >
                {/* ICON */}
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  notif.isRead ? 'bg-white/5' : 'bg-indigo-500/20 scale-110'
                }`}>
                  {getIcon(notif.type)}
                </div>

                {/* CONTENT */}
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-black tracking-tight ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      {formatTimeAgo(new Date(notif.createdAt))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="shrink-0 flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notif._id)}
                    className="p-2 bg-white/5 text-gray-500 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* DOT */}
                {!notif.isRead && (
                  <div className="absolute top-4 left-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiZap className="h-8 w-8 text-gray-700" />
              </div>
              <p className="text-gray-500 font-medium">Your inbox is clear</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

InstructorNotificationsPage.allowedRoles = ['instructor'];

export default InstructorNotificationsPage;
