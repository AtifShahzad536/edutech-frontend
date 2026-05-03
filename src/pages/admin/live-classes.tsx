import React, { useState, useEffect, useMemo } from 'react';
import { FiRadio, FiUsers, FiClock, FiActivity, FiSearch, FiFilter, FiExternalLink, FiBarChart2, FiPlay, FiStopCircle } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthenticatedPage } from '@/types';
import API_URL from '@/config/api';
import { ChartArea } from '@/components/ui/Charts';

const AdminLiveClassesPage: AuthenticatedPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchLiveClasses = async () => {
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/live-classes`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const result = await response.json();
      if (result.success) {
        setSessions(result.data.classes);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
    const interval = setInterval(fetchLiveClasses, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.instructor?.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock graph data for live activity
  const activityData = [
    { time: '10:00', users: 45 },
    { time: '11:00', users: 82 },
    { time: '12:00', users: 156 },
    { time: '13:00', users: 120 },
    { time: '14:00', users: 210 },
    { time: '15:00', users: 185 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-24">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] -mr-40 -mt-40" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-3 bg-rose-500/10 border border-rose-500/20 px-5 py-2 rounded-full">
                <FiRadio className="h-4 w-4 text-rose-400 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase text-rose-400">Live Infrastructure Control</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                Global <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400">Sessions</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto xl:mx-0">
                Monitor every live broadcast across the platform. Real-time traffic analysis, instructor oversight, and system stability metrics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
               <div className="text-center sm:text-right">
                  <div className="text-3xl font-black text-rose-400 leading-none">{stats?.activeNow || 0}</div>
                  <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Active Streams</div>
               </div>
               <div className="w-px h-12 bg-white/10 hidden sm:block mx-4" />
               <div className="text-center sm:text-left">
                  <div className="text-3xl font-black text-white leading-none">{stats?.totalParticipants || 0}</div>
                  <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2">Live Viewers</div>
               </div>
            </div>
          </div>
        </div>

        {/* Global Live Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Platform Traffic Load</h3>
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Real-time concurrent users</span>
               </div>
               <FiActivity className="text-rose-400 h-6 w-6" />
            </div>
            <div className="h-64">
               <ChartArea data={activityData} xKey="time" yKey="users" color="#f43f5e" />
            </div>
          </div>

          <div className="bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl flex flex-col justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 text-center">Session Health</h3>
            <div className="space-y-6">
               {[
                 { label: 'Uptime', value: '99.99%', color: 'rose' },
                 { label: 'Bandwidth', value: '2.4 Gbps', color: 'indigo' },
                 { label: 'Latency', value: '42ms', color: 'emerald' },
               ].map((metric, i) => (
                 <div key={i} className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{metric.label}</span>
                   <span className={`text-xl font-black text-${metric.color}-400`}>{metric.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by class title or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/5 py-4 pl-14 pr-6 rounded-xl text-[11px] font-black uppercase tracking-widest text-white placeholder-gray-700 focus:outline-none focus:border-rose-500/30"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-rose-500/30 min-w-[200px]"
          >
            <option value="all">All Sessions</option>
            <option value="live">Live Only</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Past Sessions</option>
          </select>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredSessions.map((session) => (
            <div key={session._id} className="group bg-gray-950 rounded-3xl border border-white/5 overflow-hidden shadow-2xl hover:border-rose-500/30 transition-all flex flex-col">
              <div className="relative h-48 bg-black/60 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
                {session.status === 'live' && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-rose-600 px-3 py-1 rounded-full z-10 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Live Now</span>
                  </div>
                )}
                <FiRadio className={`h-12 w-12 ${session.status === 'live' ? 'text-rose-500' : 'text-gray-700'}`} />
                <div className="absolute bottom-4 left-6 right-6">
                  <h4 className="text-lg font-black text-white uppercase tracking-tight truncate">{session.title}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{session.course?.title}</p>
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                      {session.instructor?.avatar ? (
                        <img src={session.instructor.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-xs font-black text-rose-500">{session.instructor?.firstName[0]}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-white uppercase tracking-tight">{session.instructor?.firstName} {session.instructor?.lastName}</div>
                      <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Instructor</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-white tracking-tight">{session.peers || 0}</div>
                    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Viewers</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <FiClock className="h-3 w-3 text-gray-500 mb-2" />
                    <div className="text-[9px] font-black text-white uppercase tracking-tight">
                      {new Date(session.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <FiActivity className="text-rose-500 h-3 w-3 mb-2" />
                    <div className="text-[9px] font-black text-white uppercase tracking-tight">Stable</div>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <button className="w-full bg-white/5 hover:bg-rose-600 hover:text-white text-gray-400 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white">
                    <FiExternalLink className="mr-2" />
                    Enter Audit Mode
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredSessions.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
               <FiRadio className="h-12 w-12 text-gray-800 mx-auto mb-4" />
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No matching live sessions found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

AdminLiveClassesPage.allowedRoles = ['admin'];
export default AdminLiveClassesPage;
