import React, { useState, useRef, useEffect } from 'react';
import { 
  FiUser, FiMail, FiCamera, FiEdit, FiSave, FiAward, 
  FiBook, FiStar, FiUsers, FiMapPin, FiGlobe, FiLinkedin, FiTwitter, FiActivity, FiCheckCircle, FiX, FiPlus
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AuthenticatedPage } from '@/types';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateUserProfile } from '@/store/slices/authSlice';

const TeacherProfilePage: AuthenticatedPage = () => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { token, user: reduxUser } = useAppSelector(state => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: reduxUser?.firstName || '',
    lastName: reduxUser?.lastName || '',
    email: reduxUser?.email || '',
    title: reduxUser?.title || 'Expert Instructor',
    bio: reduxUser?.bio || '',
    skills: reduxUser?.skills || ['React', 'Node.js', 'JavaScript'],
    website: reduxUser?.website || '',
    linkedin: reduxUser?.linkedin || '',
    twitter: reduxUser?.twitter || '',
    location: reduxUser?.location || '',
    avatar: reduxUser?.avatar || ''
  });

  const [newSkill, setNewSkill] = useState('');

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageRating: 0,
    totalReviews: 0
  });

  // Sync with Redux user if it changes
  useEffect(() => {
    if (reduxUser) {
      setProfileData(prev => ({
        ...prev,
        firstName: reduxUser.firstName || prev.firstName,
        lastName: reduxUser.lastName || prev.lastName,
        email: reduxUser.email || prev.email,
        title: reduxUser.title || prev.title,
        bio: reduxUser.bio || prev.bio,
        skills: reduxUser.skills || prev.skills,
        website: reduxUser.website || prev.website,
        linkedin: reduxUser.linkedin || prev.linkedin,
        twitter: reduxUser.twitter || prev.twitter,
        location: reduxUser.location || prev.location,
        avatar: reduxUser.avatar || prev.avatar,
      }));
    }
  }, [reduxUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile with token:', token?.substring(0, 10) + '...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        console.log('Profile Fetch Result:', result);
        
        if (result.success && result.data?.user) {
          const user = result.data.user;
          setProfileData(prev => ({
            ...prev,
            ...user,
            firstName: user.firstName || prev.firstName,
            lastName: user.lastName || prev.lastName,
            email: user.email || prev.email,
            bio: user.bio || prev.bio,
            skills: user.skills || prev.skills,
          }));
        }

        // Fetch instructor stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsResult = await statsRes.json();
        if (statsResult.success) {
          setStats({
            totalStudents: statsResult.data.stats.totalStudents,
            totalCourses: statsResult.data.stats.totalCourses,
            averageRating: statsResult.data.stats.rating,
            totalReviews: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch instructor profile:', error);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Use Redux action for updating profile to keep global state in sync
      const resultAction = await dispatch(updateUserProfile(profileData));
      if (updateUserProfile.fulfilled.match(resultAction)) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        // Update local state and sync with backend
        setProfileData(prev => ({ ...prev, avatar: result.data }));
        // Also update the global auth state
        dispatch(updateUserProfile({ avatar: result.data }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skillToRemove)
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 md:space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleImageUpload}
        />

        {/* Profile Header Hero */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-8 md:p-12 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-emerald-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-10">
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl overflow-hidden border-2 border-emerald-500/30 p-1 bg-black/40 backdrop-blur-xl">
                <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center overflow-hidden relative">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="h-16 w-16 text-gray-700" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                       <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-4 border-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiCamera className="h-5 w-5" />
              </button>
            </div>

            {/* Name & Title */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
                <FiCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Verified Instructor</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
                {profileData.firstName || 'Instructor'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">{profileData.lastName}</span>
              </h1>
              <p className="text-lg font-medium text-gray-400 max-w-2xl">{profileData.title}</p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
                <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  <FiMapPin className="text-emerald-400" />
                  {profileData.location || 'Remote / Global'}
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  <FiMail className="text-emerald-400" />
                  {profileData.email}
                </div>
              </div>

              <div className="flex justify-center lg:justify-start gap-4 pt-6">
                 <Button
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  className="px-8 py-3.5 text-[10px] uppercase font-black tracking-widest rounded-xl"
                >
                  <FiEdit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-80 shrink-0">
               {[
                { label: 'Students', value: stats.totalStudents.toLocaleString(), icon: FiUsers, color: 'text-indigo-400' },
                { label: 'Courses', value: stats.totalCourses.toString(), icon: FiBook, color: 'text-emerald-400' },
                { label: 'Rating', value: stats.averageRating.toString(), icon: FiStar, color: 'text-amber-400' },
                { label: 'Reviews', value: stats.totalReviews.toLocaleString(), icon: FiAward, color: 'text-cyan-400' },
              ].map((s: any, i: number) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-all shadow-xl group/stat">
                    <s.icon className={`h-4 w-4 ${s.color} mx-auto mb-2 group-hover/stat:scale-110 transition-transform`} />
                    <div className="text-xl font-black text-white tracking-tight">{s.value}</div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bio & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Me Section */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20" />
               <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
                  <FiUser className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">Biography</h2>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Professional background</span>
                </div>
              </div>
              
              <p className="text-gray-400 leading-relaxed text-sm font-medium whitespace-pre-wrap">
                {profileData.bio || 'No biography provided yet. Share your story with your students!'}
              </p>
            </div>

            {/* Expertise Grid */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 shadow-2xl group">
               <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
                  <FiAward className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">Expertise</h2>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Skills & Specializations</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {profileData.skills.length > 0 ? profileData.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="px-6 py-2.5 bg-black/40 border border-white/5 text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-400 transition-all cursor-default"
                  >
                    {skill}
                  </div>
                )) : (
                   <p className="text-gray-600 text-xs italic uppercase tracking-widest">No skills listed yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-8">
             {/* Contact & Socials */}
             <div className="bg-gray-950 border border-white/5 rounded-3xl p-8 shadow-2xl group">
               <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-8">Connect</h3>
               
               <div className="space-y-6">
                  <a href={profileData.website?.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all ${!profileData.website && 'opacity-50 pointer-events-none'}`}>
                    <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 text-emerald-400">
                      <FiGlobe className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Website</p>
                      <p className="text-xs font-medium text-white truncate">{profileData.website || 'Not set'}</p>
                    </div>
                  </a>

                  <a href={profileData.linkedin?.startsWith('http') ? profileData.linkedin : `https://linkedin.com/in/${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all ${!profileData.linkedin && 'opacity-50 pointer-events-none'}`}>
                    <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 text-indigo-400">
                      <FiLinkedin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">LinkedIn</p>
                      <p className="text-xs font-medium text-white truncate">{profileData.linkedin || 'Not set'}</p>
                    </div>
                  </a>

                  <a href={profileData.twitter?.startsWith('http') ? profileData.twitter : `https://twitter.com/${profileData.twitter}`} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all ${!profileData.twitter && 'opacity-50 pointer-events-none'}`}>
                    <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 text-cyan-400">
                      <FiTwitter className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Twitter</p>
                      <p className="text-xs font-medium text-white truncate">{profileData.twitter || 'Not set'}</p>
                    </div>
                  </a>
               </div>
             </div>

             {/* Recent Activity Mini-Feed */}
             <div className="bg-white/5 border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <FiActivity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Updates</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { title: 'Course Published', time: '3 days ago', icon: FiBook, color: 'text-emerald-400' },
                    { title: '150 New Students', time: 'This week', icon: FiUsers, color: 'text-indigo-400' },
                    { title: 'New 5-Star Review', time: '1 day ago', icon: FiStar, color: 'text-amber-400' },
                  ].map((act, i) => (
                    <div key={i} className="flex gap-4 group/item">
                       <div className="relative">
                          <div className={`w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center ${act.color} z-10 relative`}>
                            <act.icon className="h-3.5 w-3.5" />
                          </div>
                          {i !== 2 && <div className="absolute top-8 left-1/2 w-px h-10 bg-white/5 -translate-x-1/2" />}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-white uppercase tracking-tight group-hover/item:text-emerald-400 transition-colors">{act.title}</p>
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">{act.time}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Edit Overlay / Modal */}
        {isEditing && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-8 animate-in slide-in-from-bottom-10 duration-500">
                 <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Edit Profile</h2>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Update your professional details</p>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all">
                      <FiX className="h-5 w-5" />
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">Basic Information</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="First Name"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            className="bg-black/40 border-white/10 text-white"
                          />
                          <Input
                            label="Last Name"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            className="bg-black/40 border-white/10 text-white"
                          />
                       </div>
                       <Input
                          label="Professional Title"
                          value={profileData.title}
                          onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                          className="bg-black/40 border-white/10 text-white"
                        />
                        <Input
                          label="Location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="bg-black/40 border-white/10 text-white"
                        />
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Biography</label>
                           <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            rows={4}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                            placeholder="Tell us about your journey..."
                          />
                        </div>
                    </div>

                    {/* Skills & Socials */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">Skills & Socials</h3>
                        
                        {/* Skills Manager */}
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Areas of Expertise</label>
                           <div className="flex flex-wrap gap-2 mb-4">
                              {profileData.skills.map((skill: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                  {skill}
                                  <button onClick={() => removeSkill(skill)}><FiX className="h-3 w-3" /></button>
                                </div>
                              ))}
                           </div>
                           <div className="flex gap-2">
                              <Input
                                placeholder="Add a skill (e.g. Docker)"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                className="bg-black/40 border-white/10 text-white flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                              />
                              <Button onClick={addSkill} variant="secondary" className="px-4 rounded-xl">
                                <FiPlus />
                              </Button>
                           </div>
                        </div>

                        {/* Social Inputs */}
                        <div className="space-y-4 pt-2">
                           <Input
                              label="Website URL"
                              value={profileData.website}
                              onChange={(e: any) => setProfileData({...profileData, website: e.target.value})}
                              className="bg-black/40 border-white/10 text-white"
                              startIcon={<FiGlobe className="text-gray-500" />}
                            />
                            <Input
                              label="LinkedIn Profile / ID"
                              value={profileData.linkedin}
                              onChange={(e: any) => setProfileData({...profileData, linkedin: e.target.value})}
                              className="bg-black/40 border-white/10 text-white"
                              startIcon={<FiLinkedin className="text-gray-500" />}
                            />
                            <Input
                              label="Twitter Username"
                              value={profileData.twitter}
                              onChange={(e: any) => setProfileData({...profileData, twitter: e.target.value})}
                              className="bg-black/40 border-white/10 text-white"
                              startIcon={<FiTwitter className="text-gray-500" />}
                            />
                        </div>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-8 border-t border-white/5">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl" 
                      variant="primary"
                    >
                       {isSaving ? 'Saving Changes...' : <><FiSave className="mr-2 h-4 w-4" /> Save All Changes</>}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl" variant="secondary">
                       Cancel
                    </Button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
};

TeacherProfilePage.allowedRoles = ['instructor', 'admin'];
export default TeacherProfilePage;
