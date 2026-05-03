import React, { useState, useEffect } from 'react';
import { 
  FiLock, FiBell, FiShield, FiTrash2, FiSave, FiCheckCircle, FiAlertTriangle 
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AuthenticatedPage } from '@/types';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import apiClient from '@/config/apiClient';
import toast from 'react-hot-toast';
import { updateUserSettings } from '@/store/slices/authSlice';

const TeacherSettingsPage: AuthenticatedPage = () => {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('security');
  const [isSaving, setIsSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState(user?.settings || {
    emailAlerts: true,
    studentEnrollment: true,
    courseMilestones: false,
    platformUpdates: true
  });

  useEffect(() => {
    if (user?.settings) {
      setNotifications(user.settings);
    }
  }, [user?.settings]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    
    try {
      await dispatch(updateUserSettings(updated)).unwrap();
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
      setNotifications(notifications); // Rollback
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
            <p className="text-sm text-gray-500 font-medium">Manage your account security and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: NAV TABS */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'security', label: 'Security', icon: FiLock },
              { id: 'notifications', label: 'Notifications', icon: FiBell },
              { id: 'privacy', label: 'Privacy & Safety', icon: FiShield },
              { id: 'danger', label: 'Danger Zone', icon: FiTrash2, color: 'text-red-500' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <item.icon className={`h-4 w-4 ${item.color || ''}`} />
                {item.label}
              </button>
            ))}
          </div>

          {/* RIGHT: CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* SECURITY SECTION */}
            {activeTab === 'security' && (
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                    <FiLock className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Security</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Update your credentials</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="bg-black/40 border-white/10"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      className="bg-black/40 border-white/10"
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      className="bg-black/40 border-white/10"
                    />
                  </div>
                  <div className="pt-2">
                    <Button 
                      type="submit"
                      loading={isSaving}
                      icon={<FiSave />}
                      className="w-full md:w-auto px-8"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeTab === 'notifications' && (
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FiBell className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Notifications</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Control how we contact you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'emailAlerts', title: 'Email Notifications', desc: 'Receive daily activity summaries via email' },
                    { id: 'studentEnrollment', title: 'New Student Alerts', desc: 'Get notified when a student joins your course' },
                    { id: 'courseMilestones', title: 'Course Milestones', desc: 'Alerts when your courses hit major milestones' },
                    { id: 'platformUpdates', title: 'Platform Updates', desc: 'News about features and system maintenance' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-200">{item.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          notifications[item.id as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRIVACY SECTION (Placeholder) */}
            {activeTab === 'privacy' && (
              <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center space-y-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                <FiShield className="h-12 w-12 text-indigo-400 mx-auto mb-2" />
                <h3 className="text-xl font-black text-white">Privacy & Safety</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">Your privacy settings are currently being synchronized with our latest security protocols. No action required.</p>
              </div>
            )}

            {/* DANGER ZONE */}
            {activeTab === 'danger' && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                    <FiTrash2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Danger Zone</h3>
                    <p className="text-xs text-red-500/50 font-bold uppercase tracking-widest">Irreversible actions</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-red-200">Delete Account</p>
                    <p className="text-xs text-red-500/70">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-500/20">
                    Delete
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

TeacherSettingsPage.allowedRoles = ['instructor'];

export default TeacherSettingsPage;
