import React, { useState } from 'react';
import { FiSave, FiGlobe, FiMail, FiDollarSign, FiShield, FiBell, FiDatabase, FiUpload, FiCheck } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AuthenticatedPage } from '@/types';

const AdminSettingsPage: AuthenticatedPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Edutech Academy',
    siteDescription: 'A premium learning platform for modern professionals.',
    supportEmail: 'support@edutech.com',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    maintenanceMode: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'USD',
    currencySymbol: '$',
    platformFee: 20,
    minPayout: 50,
    payoutSchedule: 'monthly',
    stripeEnabled: true,
    paypalEnabled: true
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.edutech.com',
    smtpPort: '587',
    smtpUsername: 'notifications@edutech.com',
    senderName: 'Edutech Platform',
    welcomeEmail: true,
    courseCompletionEmail: true,
    marketingEmails: false
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const renderGeneralTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gray-950 rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center space-x-4 mb-10">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <FiGlobe className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">General Settings</h3>
        </div>
        
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Platform Name</label>
                <input
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Site Description</label>
                <textarea
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                    rows={3}
                    className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all resize-none"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Support Email</label>
                <input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all"
                />
            </div>
        </div>
      </div>

      <div className="bg-gray-950 rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center space-x-4 mb-10">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <FiDatabase className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Time & Date</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Timezone</label>
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
              className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="UTC">Universal Coordinated Time (UTC)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Date Format</label>
            <select
              value={generalSettings.dateFormat}
              onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
              className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (Global)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-red-500/5 rounded-3xl p-10 border border-red-500/10 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                <FiShield className="h-6 w-6 text-red-400" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-2">Maintenance Mode</h3>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Limit platform access for all users during updates.</p>
            </div>
          </div>
          <button
            onClick={() => setGeneralSettings({...generalSettings, maintenanceMode: !generalSettings.maintenanceMode})}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all border ${
              generalSettings.maintenanceMode ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'bg-black/40 border-white/10'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-xl ${
              generalSettings.maintenanceMode ? 'translate-x-9' : 'translate-x-1.5'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gray-950 rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center space-x-4 mb-10">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <FiDollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Payment Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Default Currency</label>
              <select
                value={paymentSettings.currency}
                onChange={(e) => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Symbol</label>
              <input
                value={paymentSettings.currencySymbol}
                onChange={(e) => setPaymentSettings({...paymentSettings, currencySymbol: e.target.value})}
                className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all text-center"
              />
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Platform Fee (%)</label>
              <input
                type="number"
                value={paymentSettings.platformFee}
                onChange={(e) => setPaymentSettings({...paymentSettings, platformFee: parseInt(e.target.value)})}
                className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all text-center"
              />
          </div>
        </div>
      </div>

      <div className="bg-gray-950 rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center space-x-4 mb-10">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <FiUpload className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Payout Schedule</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Minimum Payout</label>
              <input
                type="number"
                value={paymentSettings.minPayout}
                onChange={(e) => setPaymentSettings({...paymentSettings, minPayout: parseInt(e.target.value)})}
                className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all"
              />
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payout Frequency</label>
              <select
                value={paymentSettings.payoutSchedule}
                onChange={(e) => setPaymentSettings({...paymentSettings, payoutSchedule: e.target.value})}
                className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
              >
                <option value="weekly">Weekly Payouts</option>
                <option value="monthly">Monthly Payouts</option>
              </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gray-950 rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center space-x-4 mb-10">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <FiMail className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Email System</h3>
        </div>
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">SMTP Host</label>
                <input
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all"
                />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">SMTP Port</label>
                    <input
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                        className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all text-center"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">SMTP Username</label>
                    <input
                        value={emailSettings.smtpUsername}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                        className="w-full bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-indigo-500/30 transition-all"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="bg-gray-950 rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center space-x-4 mb-10">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <FiBell className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'welcomeEmail', label: 'Welcome Emails', description: 'Send on new user registration.' },
            { key: 'courseCompletionEmail', label: 'Course Completion', description: 'Notify students when a course is finished.' },
            { key: 'marketingEmails', label: 'Platform Updates', description: 'General newsletters and platform news.' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-colors group/item">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight mb-1">{setting.label}</p>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{setting.description}</p>
              </div>
              <button
                onClick={() => setEmailSettings({...emailSettings, [setting.key]: !emailSettings[setting.key as keyof typeof emailSettings]})}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all border ${
                  emailSettings[setting.key as keyof typeof emailSettings] ? 'bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-black/40 border-white/10'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                  emailSettings[setting.key as keyof typeof emailSettings] ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-40">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-1.5 rounded-full">
                    <FiShield className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[9px] font-black tracking-widest uppercase text-indigo-400">Settings</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
                    Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Settings</span>
                </h1>
            </div>
            
            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center border-0 min-w-[200px] justify-center ${
                    showSuccess ? 'bg-emerald-600 text-white shadow-xl' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl active:scale-95'
                }`}
            >
                {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                ) : showSuccess ? (
                    <FiCheck className="mr-3 h-4 w-4" />
                ) : (
                    <FiSave className="mr-3 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : showSuccess ? 'Saved' : 'Save Changes'}
            </button>
        </div>

        <div className="bg-gray-950/50 rounded-2xl p-3 border border-white/5 mb-12 shadow-2xl flex flex-wrap md:flex-nowrap gap-2">
            {[
              { id: 'general', label: 'General', icon: FiGlobe, color: 'indigo' },
              { id: 'payment', label: 'Payments', icon: FiDollarSign, color: 'emerald' },
              { id: 'email', label: 'Notifications', icon: FiMail, color: 'blue' },
              { id: 'security', label: 'Security', icon: FiShield, color: 'rose' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all gap-3 border ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500/10 text-${tab.color}-400 border-${tab.color}-500/30 shadow-lg`
                    : 'bg-transparent text-gray-600 border-transparent hover:text-gray-400'
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? `text-${tab.color}-400` : 'text-gray-700'}`} />
                {tab.label}
              </button>
            ))}
        </div>

        <div className="relative">
            {showSuccess && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-8 duration-500">
                    <div className="bg-emerald-500/10 backdrop-blur-3xl border border-emerald-500/20 px-10 py-5 rounded-2xl flex items-center shadow-2xl">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4">
                            <FiCheck className="text-emerald-400 h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] italic">Settings saved successfully.</span>
                    </div>
                </div>
            )}

            {activeTab === 'general' && renderGeneralTab()}
            {activeTab === 'payment' && renderPaymentTab()}
            {activeTab === 'email' && renderEmailTab()}
            {/* Tab placeholders for consistency */}
            {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-gray-950 rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group text-center py-32">
                         <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                            <FiShield className="h-8 w-8 text-rose-400" />
                         </div>
                         <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Security Settings</h3>
                         <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none max-w-sm mx-auto">Advanced security protocols are active. Access to these parameters requires higher authorization.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
};

AdminSettingsPage.allowedRoles = ['admin'];
export default AdminSettingsPage;
