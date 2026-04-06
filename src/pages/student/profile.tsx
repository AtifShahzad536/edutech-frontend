import React, { useState } from 'react';
import { FiUser, FiMail, FiCalendar, FiEdit, FiCamera, FiAward, FiBook, FiClock, FiSettings, FiLogOut, FiUpload, FiLinkedin, FiFileText, FiCheck, FiX, FiCpu, FiActivity, FiZap, FiTarget, FiShield, FiTrendingUp, FiLayers, FiBriefcase } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateUserProfile, setUser } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import { AuthenticatedPage } from '@/types';

const StudentProfilePage: AuthenticatedPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('identity');
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkedInUpload, setShowLinkedInUpload] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    bio: user?.bio || 'Passionate student focusing on modern web development and creative design patterns.',
    location: (user as any)?.location || 'Not Specified',
    website: (user as any)?.website || '',
    linkedin: (user as any)?.linkedin || '',
    skills: (user as any)?.skills || [],
    experience: (user as any)?.experience || [],
    education: (user as any)?.education || [],
  });

  // Sync with user state after initialization
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: (user as any).phone || '',
        bio: user.bio || 'Passionate student focusing on modern web development and creative design patterns.',
        location: (user as any).location || 'Not Specified',
        website: (user as any).website || '',
        linkedin: (user as any).linkedin || '',
        skills: (user as any).skills || [],
        experience: (user as any).experience || [],
        education: (user as any).education || [],
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const dispatch = useAppDispatch();
  const handleLinkedInUpload = async () => {
    if (!uploadedDocument || isProcessing) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const formDataUpload = new FormData();
      formDataUpload.append('document', uploadedDocument);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile/import-linkedin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload
      });

      const result = await response.json();
      if (result.success) {
        // Merge extracted data and update Redux/DB via thunk
        const updatedData = { ...formData, ...result.data };
        const syncAction = await dispatch(updateUserProfile(updatedData));

        if (updateUserProfile.fulfilled.match(syncAction)) {
          setShowLinkedInUpload(false);
          setIsEditing(false);
          setActiveTab('professional'); // Switch to professional tab to show results
          toast.success("Profile synchronized with LinkedIn!");
        }
      } else {
        toast.error(result.message || "Failed to extract LinkedIn data");
      }
    } catch (error) {
      console.error('LinkedIn Import Failed:', error);
      toast.error("An error occurred during synchronization");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveChanges = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const resultAction = await dispatch(updateUserProfile(formData));
      if (updateUserProfile.fulfilled.match(resultAction)) {
        setIsEditing(false);
      } else {
        alert(resultAction.payload || "Failed to save changes");
      }
    } catch (error) {
      console.error('Profile Update Failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderIdentityTab = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile HUD Card */}
      <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-indigo-600/10 transition-all duration-1000" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center xl:items-start gap-12">
          <div className="relative">
            <div className="w-40 h-40 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center p-1 shadow-2xl group-hover:scale-105 transition-transform duration-700 relative overflow-hidden">
              <div className="w-full h-full bg-black rounded-xl flex items-center justify-center overflow-hidden border border-white/5 relative z-10">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="h-20 w-20 text-indigo-400 group-hover:scale-110 transition-transform duration-700 opacity-60" />
                )}
              </div>
            </div>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('image', file);
                  const token = localStorage.getItem('token');
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/profile-image`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData
                    });
                    const result = await response.json();
                    if (result.success && user) {
                      dispatch(setUser({ ...user, avatar: result.data }));
                    }
                  } catch (err) {
                    console.error('Avatar Upload Failed:', err);
                  }
                }
              }}
            />
            <label htmlFor="avatar-upload" className="absolute -bottom-3 -right-3 bg-white text-black p-3 md:p-4 rounded-xl shadow-2xl hover:scale-110 active:scale-90 transition-all z-20 cursor-pointer flex items-center justify-center">
              <FiCamera className="h-4 w-4" />
            </label>
          </div>

          <div className="flex-1 text-center xl:text-left space-y-8 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                  {formData.firstName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{formData.lastName}</span>
                </h2>
                <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4">
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                    <FiMail className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                    <FiActivity className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Status: Active</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center xl:justify-end gap-4">
                <button
                  onClick={() => setShowLinkedInUpload(true)}
                  className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600/20 transition-all flex items-center gap-3 shadow-lg"
                >
                  <FiLinkedin className="h-4 w-4" />
                  Import Profile
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl active:scale-95 border-0 ${isEditing ? 'bg-rose-600 text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                >
                  {isEditing ? <FiX className="h-4 w-4" /> : <FiEdit className="h-4 w-4" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/40 rounded-full" />
              <p className="text-gray-400 text-base font-medium pl-6 py-1 leading-relaxed max-w-4xl opacity-80">"{formData.bio}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
          <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <FiTarget className="text-indigo-400 h-5 w-5" />
            </div>
            Personal Details
          </h3>
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <input name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="Not Specified" className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} rows={4} className="w-full bg-black/60 border border-white/5 rounded-2xl py-6 px-8 text-white text-xs font-medium focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all resize-none leading-relaxed" />
            </div>
          </div>
        </div>

        <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all" />
          <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <FiActivity className="text-purple-400 h-5 w-5" />
            </div>
            Contact & Links
          </h3>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Current Location</label>
              <input name="location" value={formData.location} onChange={handleInputChange} disabled={!isEditing} className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Portfolio / Website</label>
                <input name="website" value={formData.website} onChange={handleInputChange} disabled={!isEditing} placeholder="https://..." className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">LinkedIn Profile</label>
                <input name="linkedin" value={formData.linkedin} onChange={handleInputChange} disabled={!isEditing} placeholder="https://linkedin.com/..." className="w-full bg-black/60 border border-white/5 rounded-xl py-5 px-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 disabled:opacity-40 transition-all" />
              </div>
            </div>
            {isEditing && (
              <div className="pt-6 animate-in fade-in zoom-in-95 duration-500">
                <button onClick={handleSaveChanges} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 border-0">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="w-full pb-40 space-y-20 animate-in fade-in duration-1000">
        {/* Navigation HUD */}
        <div className="flex justify-center xl:justify-start">
          <div className="bg-gray-950 border border-white/5 rounded-2xl p-2 inline-flex flex-wrap gap-2 shadow-2xl relative">
            {[
              { id: 'identity', label: 'Profile', icon: FiUser, color: 'indigo' },
              { id: 'professional', label: 'Work Hub', icon: FiTrendingUp, color: 'purple' },
              { id: 'achievements', label: 'Badges', icon: FiAward, color: 'emerald' },
              { id: 'security', label: 'Privacy', icon: FiShield, color: 'rose' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all gap-3 border ${activeTab === tab.id
                  ? `bg-white text-black border-white shadow-xl`
                  : 'bg-transparent text-gray-600 border-transparent hover:text-gray-400'
                  }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? `text-black` : 'text-gray-700'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[600px] relative">
          {activeTab === 'identity' && renderIdentityTab()}
          {activeTab === 'professional' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Skills Section */}
              <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
                <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4 mb-10">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <FiZap className="text-indigo-400 h-5 w-5" />
                  </div>
                  Tech Stack & Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {formData.skills.length > 0 ? formData.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-white/5 border border-white/5 text-[10px] font-bold text-indigo-300 uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all cursor-default">
                      {skill}
                    </span>
                  )) : (
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No skills imported yet.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Experience Card */}
                <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl space-y-10 relative overflow-hidden">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <FiTrendingUp className="text-purple-400 h-5 w-5" />
                    </div>
                    Work Experience
                  </h3>
                  <div className="space-y-10">
                    {formData.experience.length > 0 ? formData.experience.map((exp: any, i: number) => (
                      <div key={i} className="flex gap-6 group/item relative">
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-white/5 flex items-center justify-center shadow-xl group-hover/item:scale-110 transition-transform duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-purple-500/5 animate-pulse" />
                            <FiBriefcase className="h-6 w-6 text-purple-400 relative z-10" />
                          </div>
                          {i !== formData.experience.length - 1 && <div className="w-px h-full bg-gradient-to-b from-white/5 to-transparent mt-4" />}
                        </div>
                        <div className="space-y-2 flex-1 pb-8">
                          <h4 className="text-md font-black text-white uppercase tracking-tight leading-none mb-1">{exp.title}</h4>
                          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{exp.company} • {exp.duration}</p>
                          <p className="text-xs text-gray-500 leading-relaxed mt-4 opacity-80">{exp.description}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-600 text-xs font-bold uppercase tracking-widest text-center py-10 border border-dashed border-white/5 rounded-2xl">Awaiting Career History...</p>
                    )}
                  </div>
                </div>

                {/* Education Card */}
                <div className="bg-gray-950 border border-white/5 rounded-2xl p-8 md:p-10 shadow-2xl space-y-10 relative overflow-hidden">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <FiLayers className="text-emerald-400 h-5 w-5" />
                    </div>
                    Education
                  </h3>
                  <div className="space-y-10">
                    {formData.education.length > 0 ? formData.education.map((edu: any, i: number) => (
                      <div key={i} className="flex gap-6 group/item relative">
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-white/5 flex items-center justify-center shadow-xl group-hover/item:scale-110 transition-transform duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                            <FiBook className="h-6 w-6 text-emerald-400 relative z-10" />
                          </div>
                          {i !== formData.education.length - 1 && <div className="w-px h-full bg-gradient-to-b from-white/5 to-transparent mt-4" />}
                        </div>
                        <div className="space-y-2 flex-1 pb-8">
                          <h4 className="text-md font-black text-white uppercase tracking-tight leading-none mb-1">{edu.degree}</h4>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{edu.school}</p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">{edu.fieldOfStudy} • {edu.duration}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-600 text-xs font-bold uppercase tracking-widest text-center py-10 border border-dashed border-white/5 rounded-2xl">Academic Details Awaiting...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'identity' && activeTab !== 'professional' && (
            <div className="bg-gray-950 border border-white/5 rounded-2xl p-24 text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/[0.02] animate-pulse" />
              <div className="w-24 h-24 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20 shadow-inner relative z-10 group-hover:scale-110 transition-transform">
                <FiCpu className="h-10 w-10 text-indigo-400 animate-pulse opacity-60" />
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">Coming Soon</h3>
                <p className="text-gray-600 max-w-lg mx-auto font-bold uppercase tracking-[0.3em] leading-tight text-[9px]">This section is undergoing maintenance. Please check back later.</p>
              </div>
            </div>
          )}
        </div>

        {/* LinkedIn Import Modal (Premium Redesign) */}
        {showLinkedInUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-all animate-in fade-in duration-300">
            <div className={`absolute inset-0 bg-black/90 backdrop-blur-2xl ${isProcessing ? 'cursor-wait' : 'cursor-default'}`} onClick={() => !isProcessing && setShowLinkedInUpload(false)} />
            <div className="relative bg-gray-950 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-16 max-w-xl w-full shadow-[0_60px_150px_rgba(0,0,0,0.8)] space-y-6 md:space-y-12 animate-in slide-in-from-bottom-12 duration-500 overflow-y-auto max-h-[95vh] scrollbar-hide">
              {/* Close Button Header */}
              <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
                <button
                  onClick={() => setShowLinkedInUpload(false)}
                  disabled={isProcessing}
                  className="w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center space-y-4 md:space-y-6 pt-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                  <FiLinkedin className="h-8 w-8 md:h-10 md:w-10 text-blue-500 relative z-10" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight">Import Profile <br /><span className="text-blue-500 text-xl md:text-4xl">Analytics</span></h3>
                <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] max-w-xs mx-auto">Upload your LinkedIn resume to auto-populate your professional identity.</p>
              </div>

              <div className="border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-12 text-center hover:border-blue-500/40 transition-all group bg-black/40 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                <FiFileText className="h-8 w-8 md:h-10 md:w-10 text-gray-800 mx-auto mb-4 md:mb-6 group-hover:text-blue-500 transition-colors relative z-10" />
                <p className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 md:mb-8 relative z-10 truncate px-4">
                  {uploadedDocument ? uploadedDocument.name : 'Awaiting Document...'}
                </p>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setUploadedDocument(e.target.files?.[0] || null)} className="hidden" id="node-upload" />
                <label htmlFor="node-upload" className="cursor-pointer bg-white hover:bg-gray-100 active:scale-95 text-black px-8 py-4 md:px-10 md:py-5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl relative z-10 inline-block">
                  Select File
                </label>
              </div>

              <div className="flex flex-col gap-3 md:gap-4 pb-4">
                <button
                  onClick={handleLinkedInUpload}
                  disabled={!uploadedDocument || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] transition-all disabled:opacity-30 border-0 shadow-lg active:scale-95 flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="ml-2">Processing Intelligence...</span>
                    </div>
                  ) : (
                    <>
                      <FiCheck className="h-4 w-4" />
                      Confirm & Sync
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowLinkedInUpload(false)}
                  disabled={isProcessing}
                  className="w-full py-5 md:py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white border border-white/5 transition-all outline-none disabled:opacity-20"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

StudentProfilePage.allowedRoles = ['student', 'instructor', 'admin'];
export default StudentProfilePage;
