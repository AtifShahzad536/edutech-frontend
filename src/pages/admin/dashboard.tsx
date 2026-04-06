import React from 'react';
import { useRouter } from 'next/router';
import { 
  FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp, FiUser, 
  FiEye, FiCalendar, FiBarChart2, FiCpu, FiActivity, 
  FiShield, FiZap, FiSettings, FiTerminal, FiGlobe, FiRadio, FiMessageSquare
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { ChartArea } from '@/components/ui/Charts';
import { AuthenticatedPage } from '@/types';
import { useAppSelector } from '@/hooks/useRedux';
import API_URL from '@/config/api';

const AdminDashboard: AuthenticatedPage = () => {
  const router = useRouter();
  const [stats, setStats] = React.useState<any>(null);
  const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
  const { isInitialized, token } = useAppSelector((state: any) => state.auth);

  const [revenueData, setRevenueData] = React.useState([
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
  ]);

  React.useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const t = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await response.json();
        if (result.success) {
          setStats(result.stats);
          setRecentUsers(result.recentUsers);
          if (result.revenueHistory) {
             setRevenueData(result.revenueHistory);
          }
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    if (isInitialized && (token || localStorage.getItem('token'))) {
      fetchAdminStats();
    }
  }, [isInitialized, token]);

  const systemMetrics = [
    { label: 'Growth Rate', value: stats?.growthRate || '+14%', status: 'optimal', icon: FiTrendingUp, color: 'indigo' },
    { label: 'Active Courses', value: stats?.totalCourses?.toString() || '0', status: 'normal', icon: FiBookOpen, color: 'cyan' },
    { label: 'Total Students', value: stats?.students?.toLocaleString() || '0', status: 'secure', icon: FiZap, color: 'emerald' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`, status: 'high', icon: FiDollarSign, color: 'amber' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 md:space-y-12 pb-20 animate-in fade-in duration-1000">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-10 text-white border border-white/5 shadow-2xl group min-h-[250px] md:min-h-[350px] flex items-center">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-indigo-600/20" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-12 w-full max-w-full">
            <div className="flex-1 space-y-4 md:space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
                <FiGlobe className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">System Status // Healthy</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                Admin <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Dashboard</span>
              </h1>
              
              <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto xl:mx-0 font-medium leading-relaxed">
                Welcome back! All systems are running smoothly. Manage your users, content, and growth projects from here.
              </p>
 
              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3 md:gap-4">
                <button 
                  onClick={() => router.push('/admin/users')}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all shadow-lg active:scale-95 border-0 flex items-center justify-center"
                >
                  <FiUsers className="mr-2 h-4 w-4" />
                  Manage Users
                </button>
                <button 
                  onClick={() => router.push('/admin/settings')}
                  className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 md:px-8 py-3.5 md:py-4 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center"
                >
                  <FiSettings className="mr-2 h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>
            
            <div className="w-full xl:w-[350px] shrink-0">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {systemMetrics.map((metric, i) => (
                  <div key={i} className="group bg-white/5 border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-white/10 transition-all shadow-lg">
                    <div className="flex flex-col items-start space-y-3">
                      <div className={`p-2 rounded-xl bg-${metric.color}-500/10 text-${metric.color}-400 border border-${metric.color}-500/20`}>
                        <metric.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">{metric.value}</div>
                        <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1.5 leading-none">{metric.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          <div className="lg:col-span-2 bg-gray-950 border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative z-10 gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">Revenue Overview</h3>
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Global platform earnings</span>
              </div>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                <button className="px-4 py-1.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-wider">Revenue</button>
              </div>
            </div>
            
            <div className="h-[250px] md:h-[350px]">
              <ChartArea 
                data={revenueData}
                xKey="month"
                yKey="revenue"
                color="#6366F1"
              />
            </div>
          </div>

          <div className="bg-gray-950 border border-white/5 rounded-3xl p-6 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center space-x-4 mb-6 md:mb-8">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <FiTrendingUp className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black tracking-tight uppercase leading-none">Platform Growth</h2>
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1.5 block">Live Updates</span>
                </div>
              </div>
  
              <div className="flex-1 space-y-4">
                {[
                  { label: 'Total Revenue', value: '$72,400', color: 'bg-emerald-500' },
                  { label: 'New Students', value: '+128', color: 'bg-indigo-500' },
                  { label: 'Success Rate', value: '94%', color: 'bg-cyan-400' },
                ].map((s, i) => (
                  <div key={i} className="group/item relative bg-black/40 border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-white/5 transition-all shadow-lg">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 ${s.color} rounded-full`} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{s.label}</span>
                      </div>
                      <span className="text-base font-black text-white tracking-tight">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
  
              <button 
                onClick={() => router.push('/admin/reports')}
                className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl"
              >
                Detailed Reports
              </button>
            </div>
          </div>
        </div>
 
        {/* Oversight Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 pt-4">
          <div className="bg-gray-950 border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Recent Activity</h3>
                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Latest platform actions</span>
              </div>
              <button 
                onClick={() => router.push('/admin/users')}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                View Directory
              </button>
            </div>
 
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="group/node relative bg-black/40 border border-white/5 rounded-2xl p-4 md:p-5 hover:bg-white/5 transition-all flex items-center justify-between cursor-pointer shadow-lg">
                   <div className="flex items-center space-x-5 relative z-10">
                      <div className="relative">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-900 rounded-xl border border-white/5 flex items-center justify-center font-black text-lg text-indigo-500">
                          {user.name.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-gray-950 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'} `} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-black text-white uppercase tracking-tight leading-none truncate max-w-[120px] md:max-w-none">{user.name}</div>
                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none truncate max-w-[120px] md:max-w-none">{user.role} • {user.email}</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-xl font-black text-white tracking-tight leading-none">{user.activity}%</div>
                      <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none">Activity</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
 
          <div className="bg-gray-950 border border-white/5 rounded-3xl p-6 md:p-10 text-white shadow-2xl flex flex-col min-h-[450px]">
             <div className="flex items-center justify-between mb-8">
               <div className="text-left">
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">System Updates</h3>
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest block mt-1.5">Latest platform updates</span>
               </div>
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
            
            <div className="flex-1 space-y-4 pt-2 pb-8 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { title: 'New Course Published', desc: 'React Advanced patterns by Cassian Andor', time: '5m ago' },
                { title: 'Security Check Complete', desc: 'All platform systems verified and secure', time: '12m ago' },
                { title: 'Enrollment Spike', desc: 'Modern Web Design saw +120 new students', time: '1h ago' },
                { title: 'Maintenance Scheduled', desc: 'System update coming this Friday at 2AM', time: '2h ago' },
              ].map((log, i) => (
                <div key={i} className="group/log bg-white/5 p-4 rounded-2xl border-l-[3px] border-indigo-600 transition-all flex items-start gap-4 shadow-lg hover:bg-white/10">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                     <FiZap className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">{log.title}</p>
                    <p className="text-[9px] font-medium text-gray-500 leading-normal">{log.desc}</p>
                    <p className="text-[7px] font-bold text-gray-700 uppercase tracking-widest pt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
 
            <button 
              onClick={() => router.push('/admin/reports')}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center transition-all shadow-xl"
            >
               View Activity History
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

AdminDashboard.allowedRoles = ['admin'];
export default AdminDashboard;
