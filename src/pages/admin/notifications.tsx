import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiBell, FiCheck, FiX, FiCheckCircle, FiTrash2, FiZap, 
  FiAward, FiBook, FiMessageSquare, FiCalendar, FiActivity, FiInfo, FiShield
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

const AdminNotificationsPage: AuthenticatedPage = () => {
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
    <DashboardLayout title="Admin Intelligence">
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        
        {/* Page Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-rose-600/20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center space-x-3 bg-rose-500/10 border border-rose-500/20 px-5 py-2 rounded-full">
                <FiShield className="h-4 w-4 text-rose-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-rose-400">System Intelligence</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400">Alerts</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl leading-relaxed">
                Stay updated with platform-wide activity, security alerts, and administrative notifications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                  {['all', 'unread'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setFilter(opt)}
                      className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                        filter === opt ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/20' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        <div className="space-y-6">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-32 bg-gray-950/50 rounded-3xl border border-white/5 border-dashed">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.3)]"></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Syncing Intelligence...</span>
              </div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div 
                key={notif._id}
                className={`group relative flex items-start gap-6 p-8 rounded-[2rem] border transition-all duration-500 ${
                  notif.isRead 
                    ? 'bg-gray-950/50 border-white/5 hover:bg-white/[0.03]' 
                    : 'bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10 shadow-2xl shadow-rose-500/5'
                }`}
              >
                {/* ICON */}
                <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  notif.isRead ? 'bg-white/5 border border-white/5' : 'bg-rose-500/20 border border-rose-500/30 scale-110 shadow-inner'
                }`}>
                  <div className="transform transition-transform group-hover:scale-110">
                    {getIcon(notif.type)}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-black tracking-tight uppercase ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest italic">
                      {formatTimeAgo(new Date(notif.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="shrink-0 flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif._id)}
                      title="Mark as Read"
                      className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg border border-emerald-500/20 flex items-center justify-center"
                    >
                      <FiCheckCircle className="h-5 w-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notif._id)}
                    title="Delete Permanently"
                    className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg border border-rose-500/20 flex items-center justify-center"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* DOT */}
                {!notif.isRead && (
                  <div className="absolute top-6 left-6 w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.6)]" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-40 bg-gray-950/50 border border-white/5 border-dashed rounded-[3rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent opacity-30" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                  <FiBell className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Zero Notifications</h3>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none italic px-10">Your system intelligence logs are currently empty. All systems normal.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

AdminNotificationsPage.allowedRoles = ['admin'];

export default AdminNotificationsPage;
