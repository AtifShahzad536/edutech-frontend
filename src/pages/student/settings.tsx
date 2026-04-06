import React, { useState } from 'react';
import { FiUser, FiLock, FiBell, FiShield, FiCreditCard, FiTrash2, FiSave, FiCheck, FiGlobe, FiActivity, FiZap, FiCpu, FiTarget } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthenticatedPage } from '@/types';

const StudentSettingsPage: AuthenticatedPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Passionate learner interested in web development and design.',
    website: 'https://johndoe.com',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    language: 'en',
  });

  // Notification preferences
  const [notifications, setNotificationsState] = useState({
    pushNotifications: true,
    emailAlerts: true,
    courseUpdates: true,
    assignmentReminders: true,
    communityActivity: false,
    marketingEmails: false,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotificationsState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const InputField = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
    <div className="space-y-3">
      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors h-4 w-4" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-black/60 border border-white/5 rounded-xl py-5 ${Icon ? 'pl-14' : 'px-6'} pr-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-white/10`}
        />
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <FiUser className="text-indigo-400 h-5 w-5" />
          </div>
          Account Information
        </h3>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="First Name" value={profileData.firstName} onChange={(e:any) => setProfileData({...profileData, firstName: e.target.value})} />
            <InputField label="Last Name" value={profileData.lastName} onChange={(e:any) => setProfileData({...profileData, lastName: e.target.value})} />
          </div>
          <InputField label="Email Address" value={profileData.email} icon={FiGlobe} onChange={(e:any) => setProfileData({...profileData, email: e.target.value})} />
          <div className="space-y-3">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Personal Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows={4}
              className="w-full bg-black/60 border border-white/5 rounded-2xl py-6 px-8 text-white text-xs font-medium focus:outline-none focus:border-indigo-500/30 transition-all resize-none leading-relaxed placeholder:text-white/10"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <FiGlobe className="text-cyan-400 h-5 w-5" />
          </div>
          Regional Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Location" value={profileData.location} onChange={(e:any) => setProfileData({...profileData, location: e.target.value})} />
          <div className="space-y-3">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Time Zone</label>
            <select
              value={profileData.timezone}
              onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
              className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-cyan-500/30 appearance-none cursor-pointer"
            >
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="UTC">UTC / Universal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="bg-white hover:bg-gray-100 text-black px-12 py-5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 flex items-center gap-4 border-0"
        >
          {isSaving ? <FiCpu className="animate-spin h-4 w-4" /> : <FiSave className="h-4 w-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all" />
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <FiLock className="text-rose-400 h-5 w-5" />
          </div>
          Password & Security
        </h3>
        <div className="space-y-8 max-w-xl">
          <InputField label="Current Password" type="password" placeholder="••••••••" />
          <InputField label="New Password" type="password" placeholder="••••••••" />
          <InputField label="Confirm Password" type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-8 md:p-10 space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-rose-400 uppercase tracking-tight">Delete Account</h4>
            <p className="text-[11px] text-gray-500 font-medium">Permanently remove all your personal data and account records.</p>
          </div>
          <button className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all shadow-xl active:scale-95 border-0">
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  );

  const Toggle = ({ label, description, enabled, onToggle }: any) => (
    <div className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-2xl group hover:border-indigo-500/20 transition-all">
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-white uppercase tracking-wider">{label}</p>
        <p className="text-[9px] text-gray-500 font-medium">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
          enabled ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gray-800'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-xl ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <FiBell className="text-amber-400 h-5 w-5" />
          </div>
          Notification Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Toggle 
            label="Push Notifications" 
            description="Receive real-time alerts on your device."
            enabled={notifications.pushNotifications}
            onToggle={() => handleToggle('pushNotifications')}
          />
          <Toggle 
            label="Email Alerts" 
            description="Get important updates delivered to your inbox."
            enabled={notifications.emailAlerts}
            onToggle={() => handleToggle('emailAlerts')}
          />
        </div>
      </div>

      <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <FiZap className="text-indigo-400 h-5 w-5" />
          </div>
          Learning Activity
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Toggle 
            label="Course Updates" 
            description="New lessons and content releases."
            enabled={notifications.courseUpdates}
            onToggle={() => handleToggle('courseUpdates')}
          />
          <Toggle 
            label="Assignment Reminders" 
            description="Notifications for upcoming deadlines."
            enabled={notifications.assignmentReminders}
            onToggle={() => handleToggle('assignmentReminders')}
          />
        </div>
      </div>

      <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
        <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <FiActivity className="text-emerald-400 h-5 w-5" />
          </div>
          Engagement & Marketing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Toggle 
            label="Community Activity" 
            description="Mentions and replies in community forums."
            enabled={notifications.communityActivity}
            onToggle={() => handleToggle('communityActivity')}
          />
          <Toggle 
            label="Marketing Emails" 
            description="Special offers and new features."
            enabled={notifications.marketingEmails}
            onToggle={() => handleToggle('marketingEmails')}
          />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-40 px-4 animate-in fade-in duration-1000">
        {/* Header HUD */}
        <div className="relative space-y-4">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
            <FiZap className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Settings</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
                Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">Settings</span>
              </h1>
              <p className="text-[10px] text-gray-600 max-w-2xl font-bold uppercase tracking-widest leading-tight">
                Manage your personal information and security preferences.
              </p>
            </div>
          </div>
        </div>

        {/* HUD Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'profile', label: 'Profile', icon: FiUser, color: 'indigo-500' },
            { id: 'security', label: 'Security', icon: FiLock, color: 'rose-500' },
            { id: 'notifications', label: 'Notifications', icon: FiBell, color: 'amber-500' },
            { id: 'privacy', label: 'Privacy', icon: FiShield, color: 'emerald-500' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all gap-3 border ${
                activeTab === tab.id
                  ? `bg-white text-black border-white shadow-xl`
                  : 'bg-gray-950 text-gray-600 border-white/5 hover:border-white/10 hover:text-gray-400'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-black' : 'text-gray-700'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sector */}
        <div className="relative min-h-[500px]">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'notifications' && (
            <div className="bg-gray-950 border border-white/5 rounded-2xl p-24 text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/[0.02] animate-pulse" />
              <div className="w-24 h-24 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20 shadow-inner relative z-10 group-hover:scale-110 transition-transform">
                <FiCpu className="h-10 w-10 text-indigo-400 animate-pulse opacity-60" />
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">Coming Soon</h3>
                <p className="text-gray-600 max-w-lg mx-auto font-bold uppercase tracking-[0.3em] leading-tight text-[9px]">
                  This section is undergoing maintenance. Please check back later.
                </p>
              </div>
            </div>
          )}
        </div>

        {showSuccess && (
          <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right duration-500">
            <div className="bg-gray-950 text-white px-8 py-5 rounded-xl shadow-2xl flex items-center gap-6 border border-emerald-500/20">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <FiCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest">Settings Saved</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Changes applied successfully</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

StudentSettingsPage.allowedRoles = ['student', 'instructor', 'admin'];
export default StudentSettingsPage;


