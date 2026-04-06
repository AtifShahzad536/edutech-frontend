import React, { useEffect, useState } from 'react';
import { FiVideo, FiClock, FiUsers, FiZap, FiActivity, FiArrowRight, FiPlay, FiRadio } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { AuthenticatedPage } from '@/types';
import { selectEnrolledLiveClasses } from '@/store/index';
import { fetchLiveClasses } from '@/store/slices/liveSlice';

const StudentLiveSyncsPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const liveClasses = useAppSelector(selectEnrolledLiveClasses);
  const { isInitialized, token } = useAppSelector(state => state.auth);
  const [chartData, setChartData] = useState<{height: number, val: number}[]>([]);

  useEffect(() => {
    if (isInitialized && token) {
      dispatch(fetchLiveClasses());
      
      // Auto-refresh every 10 seconds to detect new live sessions
      const interval = setInterval(() => {
        dispatch(fetchLiveClasses());
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, token, dispatch]);

  useEffect(() => {
    const data = [...Array(24)].map(() => ({
      height: 20 + Math.random() * 80,
      val: Math.floor(Math.random() * 100)
    }));
    setChartData(data);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-12">
        {/* Hub Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl md:rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-red-600/10 backdrop-blur-3xl px-4 py-1.5 rounded-full border border-red-600/20">
              <FiRadio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-red-400">Live Learning Sessions</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight leading-none text-white">
              Live <span className="text-red-500">Classes</span>
            </h1>
            <p className="text-lg text-gray-400 font-medium max-w-2xl leading-relaxed">
              Connect to real-time sessions. Learn directly from industry experts and collaborate with your peers.
            </p>
          </div>
        </div>

        {/* Sync Feed */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Active <span className="text-red-500">Sessions</span></h2>
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Network Status: Online</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {liveClasses.map((sync) => (
              <div key={sync.id} className="group bg-gray-950 border border-white/5 rounded-2xl p-8 shadow-2xl hover:border-red-500/20 transition-all duration-300 flex flex-col xl:flex-row items-center gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all pointer-events-none" />
                
                {sync.status === 'online' && (
                  <div className="absolute top-0 right-0 bg-red-600 px-6 py-1.5 rounded-bl-xl text-[8px] font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    Live Now
                  </div>
                )}
                
                <div className="relative z-10 w-full xl:w-72 aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/5 group-hover:border-red-600/30 transition-colors">
                  <div className={`absolute inset-0 ${sync.status === 'online' ? 'bg-red-600/10' : 'bg-white/5'}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiVideo className={`h-10 w-10 ${sync.status === 'online' ? 'text-red-500' : 'text-gray-700'}`} />
                  </div>
                </div>

                <div className="relative z-10 flex-1 space-y-4 text-center xl:text-left">
                  <div className="flex items-center justify-center xl:justify-start space-x-3">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{sync.module}</span>
                    <div className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Instructor: {sync.instructorName}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white uppercase tracking-tight group-hover:text-red-500 transition-colors leading-tight">
                    {sync.title}
                  </h3>
                  <div className="flex items-center justify-center xl:justify-start space-x-6">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <FiClock className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{sync.scheduledFor}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <FiUsers className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{sync.peers} Students Joined</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => router.push(`/live-class?roomID=${sync.roomID}`)}
                  disabled={sync.status === 'upcoming'}
                  className={`relative z-10 px-10 py-5 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-2xl transition-all ${
                    sync.status === 'online' 
                    ? 'bg-white text-black hover:bg-gray-100 active:scale-95' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border-white/5'
                  }`}
                >
                  {sync.status === 'online' ? 'Join Session' : 'Starting Soon'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Live System Analytics */}
        <div className="group bg-gray-950 border border-white/5 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl transition-all duration-700 hover:border-red-500/20">
          {/* Glassy Background Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] group-hover:bg-red-600/10 transition-all duration-1000" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6 text-center md:text-left text-white">
              <div className="inline-flex items-center space-x-3 bg-red-500/5 border border-red-500/10 px-4 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Live Network Monitor</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-bold uppercase tracking-tight">System <span className="text-red-500">Analytics</span></h3>
                <p className="text-sm text-gray-400 font-medium max-w-md mx-auto md:mx-0 leading-relaxed">
                  Real-time tracking of global session activity and peer-to-peer connectivity across the learning network.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 group-hover:bg-white/10 transition-colors">
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Latency</p>
                  <p className="text-xl font-black text-white tracking-tighter">12ms</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 group-hover:bg-white/10 transition-colors">
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Packet Loss</p>
                  <p className="text-xl font-black text-emerald-500 tracking-tighter">0.0%</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-6">
              <div className="flex items-end justify-center space-x-1.5 h-24 px-4 bg-black/20 rounded-2xl border border-white/5 relative overflow-hidden group/chart">
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {chartData.map((data, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-red-600/20 rounded-t-sm transition-all duration-500 group-hover:bg-red-600/40 relative group/bar"
                    style={{ height: `${data.height}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none transform translate-y-2 group-hover/bar:translate-y-0">
                      {data.val}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">00:00</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Live Traffic Stream</span>
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

StudentLiveSyncsPage.allowedRoles = ['student', 'instructor', 'admin'];
export default StudentLiveSyncsPage;
