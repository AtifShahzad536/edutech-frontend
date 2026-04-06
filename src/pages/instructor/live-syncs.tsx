import React, { useState, useEffect } from 'react';
import { FiVideo, FiClock, FiUsers, FiZap, FiActivity, FiArrowRight, FiPlay, FiRadio, FiPlus, FiMonitor, FiSettings, FiX } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { AuthenticatedPage } from '@/types';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { scheduleLiveClass } from '@/store/slices/liveSlice';
import { selectLiveClasses, selectCourses } from '@/store/index';
import { fetchInstructorCourses } from '@/store/slices/courseSlice';

const InstructorLiveSyncsPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const liveClasses = useAppSelector(selectLiveClasses);
  const { user } = useAppSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({ title: '', module: '', courseId: '' });
  const courses = useAppSelector(selectCourses);

  useEffect(() => {
    dispatch(fetchInstructorCourses());
  }, [dispatch]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title || !newSession.module || !newSession.courseId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(scheduleLiveClass({
        courseId: newSession.courseId,
        title: newSession.title,
        module: newSession.module,
        scheduledFor: new Date().toISOString() // Or a future date if we added a date picker
      }));

      if (scheduleLiveClass.fulfilled.match(resultAction)) {
        setIsModalOpen(false);
        setNewSession({ title: '', module: '', courseId: '' });
      } else {
        alert(resultAction.payload || "Failed to schedule session");
      }
    } catch (err) {
      console.error("Schedule error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group min-h-[300px] flex items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 w-full">
            <div className="space-y-6 text-center md:text-left flex-1">
              <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full">
                <FiMonitor className="h-4 w-4 text-red-400" />
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Instructor Hub</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none text-white">
                Live Class <span className="text-indigo-500">Management</span>
              </h1>
              <p className="text-lg text-gray-400 font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
                Schedule and manage your live interactive sessions, monitor attendance, and engage with students in real-time.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white hover:bg-red-50 text-black px-10 py-5 rounded-xl flex items-center justify-center font-bold uppercase tracking-widest text-[10px] shadow-2xl transition-all"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Schedule Class
            </button>
          </div>
        </div>

        {/* Managed Syncs Grid */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Active <span className="text-indigo-500">Sessions</span></h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Platform Status: Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {liveClasses.map((sync) => (
              <div key={sync.id} className="group bg-gray-950 border border-white/5 rounded-2xl p-8 shadow-2xl hover:border-red-500/20 transition-all duration-300 flex flex-col xl:flex-row items-center gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all pointer-events-none" />
                
                <div className="relative z-10 w-full xl:w-80 aspect-video bg-gray-950 rounded-xl overflow-hidden border border-white/5">
                  <div className={`absolute inset-0 ${sync.status === 'online' ? 'bg-red-500/10' : 'bg-gray-500/5'}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiVideo className={`h-12 w-12 ${sync.status === 'online' ? 'text-red-500' : 'text-gray-700'}`} />
                  </div>
                  {sync.status === 'online' && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">{sync.duration || '00:00'}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4 text-center xl:text-left">
                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3 mb-2">
                    <span className={`px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${sync.status === 'online'
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                      {sync.status === 'online' ? 'Live Now' : sync.status}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{sync.module}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white uppercase tracking-tight group-hover:text-red-500 transition-colors leading-tight">
                    {sync.title}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Scheduled</p>
                      <p className="text-base font-bold text-white tracking-tight uppercase">{sync.scheduledFor}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Students</p>
                      <p className="text-base font-bold text-white tracking-tight uppercase">{sync.peers} Joined</p>
                    </div>
                    <div className="hidden md:block space-y-1">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-3 w-1 bg-emerald-500 rounded-full opacity-${i <= 4 ? '100' : '20'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex xl:flex-col gap-4">
                  <Button
                    onClick={() => {
                      console.log('🔗 Navigating to Studio:', sync.roomID);
                      router.push(`/instructor/live-class-studio?roomID=${sync.roomID}`);
                    }}
                    className="p-4 rounded-xl bg-gray-950 hover:bg-red-600 text-white transition-all shadow-xl active:scale-95 border border-white/10 group-hover:bg-red-600/20"
                  >
                    <FiArrowRight className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 shadow-sm">
                    <FiSettings className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-lg bg-gray-950 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <FiX className="h-6 w-6" />
              </button>

              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Schedule <span className="text-indigo-500">Live Class</span></h2>
                  <p className="text-gray-500 text-sm mt-2">Enter the details for your upcoming live session.</p>
                </div>

                <form onSubmit={handleCreateSession} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Session Title</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-red-500/50 outline-none transition-all"
                      placeholder="e.g. Modern Web Architecture // Part 1"
                      value={newSession.title}
                      onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Module / Topic</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-red-500/50 outline-none transition-all"
                      placeholder="e.g. React Advanced"
                      value={newSession.module}
                      onChange={(e) => setNewSession({ ...newSession, module: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Select Course</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-red-500/50 outline-none transition-all appearance-none cursor-pointer"
                      value={newSession.courseId}
                      onChange={(e) => setNewSession({ ...newSession, courseId: e.target.value })}
                    >
                      <option value="" disabled className="bg-gray-900">Choose a course</option>
                      {courses.map(course => (
                        <option key={course._id || (course as any).id} value={course._id || (course as any).id} className="bg-gray-900">{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all mt-4">
                    Create Live Session
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Studio Quick Launch */}
        <div className="group bg-gray-950 border border-white/5 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl transition-all duration-700 hover:border-red-500/20">
          {/* Dynamic Background */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-red-600/10 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -ml-20 -mb-20 opacity-0 group-hover:opacity-100 transition-all duration-1000" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Left Side: Visual/Context */}
            <div className="flex-1 space-y-8 text-center lg:text-left text-white">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {['Ultra-Low Latency', 'Pro-Audio Enabled', '4K Stream Ready'].map((tag) => (
                  <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:border-red-500/30 hover:text-red-400 transition-all cursor-default">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
                  Go <span className="text-indigo-500">Live</span> <br />
                  Instantly
                </h3>
                <p className="text-lg text-gray-400 font-medium max-w-xl leading-relaxed">
                  Your teaching environment is ready. Start your session and connect with your students immediately.
                </p>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-8 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">System Stable</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Platform Ready</span>
                </div>
              </div>
            </div>

            {/* Right Side: Action Card */}
            <div className="w-full lg:w-[420px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 flex flex-col items-center text-center space-y-8 group-hover:bg-white/[0.07] transition-all transform group-hover:scale-[1.02] duration-500">
              <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-2xl relative overflow-hidden group-hover:rotate-6 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent" />
                <FiZap className="h-10 w-10 text-red-500 relative z-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-bold text-white uppercase tracking-tight">Start Session</h4>
                <p className="text-xs text-gray-500 font-medium">Ready to start teaching?</p>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white hover:bg-red-50 text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <FiPlay className="h-4 w-4 fill-current" />
                Launch Studio
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

InstructorLiveSyncsPage.allowedRoles = ['instructor', 'admin'];
export default InstructorLiveSyncsPage;
