import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FiBookOpen, FiUsers, FiDollarSign, FiTrendingUp, FiPlay, 
  FiClock, FiStar, FiEye, FiBarChart2, FiPieChart, FiActivity, 
  FiVideo, FiArrowUpRight, FiZap, FiCpu, FiPlus, FiLayers, FiArrowRight, FiCheckCircle, FiMessageSquare
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { ChartLine } from '@/components/ui/Charts';
import Link from 'next/link';
import { AuthenticatedPage } from '@/types';
import { useAppSelector } from '@/hooks/useRedux';

const TeacherDashboard: AuthenticatedPage = () => {
  const router = useRouter();
  const [stats, setStats] = React.useState<any>(null);
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [activeCourses, setActiveCourses] = React.useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);
  const { isInitialized, token } = useAppSelector(state => state.auth);

  // Analytics data (Still mock for now as we don't have monthly aggregation yet)
  const revenueData = [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 9200 },
    { month: 'Mar', revenue: 10100 },
    { month: 'Apr', revenue: 12450 },
    { month: 'May', revenue: 11200 },
    { month: 'Jun', revenue: 13450 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
          setRecentActivity(statsData.recentSubmissions.map((s: any) => ({
            type: 'submission',
            message: `New submission: ${s.studentName} for ${s.assignmentTitle}`,
            time: s.submittedAt,
            icon: FiLayers,
            status: s.status
          })));
        }

        // Fetch Real Courses for Dashboard
        setCoursesLoading(true);
        const coursesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          const mapped = coursesData.data.map((c: any) => ({
            id: c._id,
            name: c.title,
            description: c.description || '',
            thumbnail: c.thumbnail,
            students: c.studentsCount || 0,
            rating: c.rating || 0,
            revenue: c.price ? c.price * (c.studentsCount || 0) : 0,
            type: c.category || 'Development',
            enrollmentRate: c.isPublished ? 'Live' : 'Draft'
          }));
          setActiveCourses(mapped);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (isInitialized && token) {
      fetchDashboardData();
    }
  }, [isInitialized, token]);

  return (
    <DashboardLayout>
      <div className="space-y-8 md:space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Dashboard Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white border border-white/5 shadow-2xl group flex flex-col xl:flex-row items-center justify-between gap-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 flex-1 space-y-6 text-center xl:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <FiCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Teacher Status // Online</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
              Teacher <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Dashboard</span>
            </h1>
            
            <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto xl:mx-0 font-medium leading-relaxed">
              Your courses are performing well with <span className="text-emerald-400">98% engagement</span>. Manage your curriculum and engage with your students.
            </p>
 
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4">
              <Link href="/instructor/live-syncs" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 py-3.5 group/btn text-[10px] uppercase font-black tracking-widest" variant="primary">
                  <FiVideo className="mr-2 h-4 w-4" />
                  Start Live Session
                </Button>
              </Link>
              <Link href="/instructor/create-course" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 py-3.5 text-[10px] uppercase font-black tracking-widest" variant="secondary">
                  <FiPlus className="mr-2 h-4 w-4" />
                  New Course
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div className="w-full xl:w-80 shrink-0 relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Reach</h3>
                <FiActivity className="h-4 w-4 text-emerald-400" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-white uppercase tracking-tight">Engagement</span>
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-[2s]" style={{ width: '92%' }} />
                  </div>
                </div>
                
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xl font-bold text-white tracking-tight">${stats?.totalRevenue?.toLocaleString() || '0'}</div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Monthly Revenue</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                      <FiTrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-400">T{i}</div>
                  ))}
                </div>
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">Live Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Level Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Courses', value: (stats?.totalCourses || 0).toString(), icon: FiLayers, color: 'text-emerald-400' },
                { label: 'Avg Rating', value: (stats?.rating || 4.8).toString(), icon: FiStar, color: 'text-amber-400' },
                { label: 'Students', value: (stats?.totalStudents || 0).toLocaleString(), icon: FiUsers, color: 'text-indigo-400' },
                { label: 'Syncs', value: (stats?.activeAssignments || 0).toString(), icon: FiZap, color: 'text-cyan-400' },
            ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all shadow-xl group text-center">
                    <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                    <div className="text-2xl font-black text-white tracking-tight mb-1">{stat.value}</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Revenue Insights</h2>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Last 6 months performance</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/5">
                <button className="px-5 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest transition-all">Revenue</button>
                <button className="px-5 py-2 rounded-lg text-gray-500 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all">Students</button>
              </div>
            </div>
            <div className="h-64 sm:h-80">
              <ChartLine 
                data={revenueData}
                xKey="month"
                yKey="revenue"
                color="#10b981"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-950 border border-white/5 rounded-3xl p-8 flex flex-col shadow-2xl group min-h-[400px]">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
                <FiActivity className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Activity</h2>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Latest updates</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {recentActivity.map((log, i) => (
                <div key={i} className="group/log relative bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer shadow-lg overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20" />
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                      <log.icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                       <p className="text-xs font-medium text-gray-300 leading-relaxed truncate">{log.message}</p>
                       <div className="flex items-center space-x-3">
                         <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{log.time}</span>
                         <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">{log.status}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
 
            <Button 
              onClick={() => router.push('/instructor/assignments')}
              className="mt-8 py-4 rounded-xl text-[10px] uppercase tracking-widest font-black" 
              variant="secondary" 
              size="lg"
            >
              View All Activity
            </Button>
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Courses</h2>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Global curriculum performance</span>
            </div>
            <Link href="/instructor/courses">
              <Button variant="secondary" className="px-6 py-2.5 rounded-xl text-[9px] uppercase tracking-widest font-black">
                View All Courses
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {coursesLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-80 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent shadow-inner" />
                </div>
              ))
            ) : activeCourses.length > 0 ? (
              activeCourses.slice(0, 3).map((course, i) => (
                <div 
                  key={course.id || i} 
                  onClick={() => router.push(`/instructor/courses?id=${course.id}`)}
                  className="group/c bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer shadow-xl flex flex-col h-full relative"
                >
                  {/* Thumbnail */}
                  <div className="relative h-36 bg-gray-900 overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.name} 
                        className="w-full h-full object-cover group-hover/c:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 z-0" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover/c:scale-110 transition-transform duration-700">
                      <FiLayers className="h-10 w-10 text-white" />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                      {course.enrollmentRate}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-emerald-600/90 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest leading-none">
                      {course.type}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-white tracking-tight line-clamp-2 leading-snug group-hover/c:text-emerald-400 transition-colors">
                        {course.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <FiStar className="h-3 w-3 text-amber-400" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{course.rating} Avg.</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{course.students.toLocaleString()} Active</span>
                      </div>
                    </div>

                    {/* Revenue Block */}
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[7px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">Revenue</p>
                        <span className="text-lg font-black text-white tracking-tighter">${course.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                        <FiZap className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/instructor/analytics?courseId=${course.id}`);
                        }}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-400 transition-colors group/analysis"
                      >
                        <FiActivity className="h-3 w-3 group-hover/analysis:scale-110 transition-transform" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Analysis</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-emerald-400 group-hover/c:translate-x-1 transition-transform">
                        <span className="text-[8px] font-bold uppercase tracking-widest">Manage</span>
                        <FiArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <FiLayers className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">No Courses Found</h3>
                <p className="text-gray-500 text-sm mt-1">You haven't created any courses yet.</p>
                <Link href="/instructor/create-course" className="inline-block mt-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">
                  Create First Course
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

TeacherDashboard.allowedRoles = ['instructor', 'admin'];
export default TeacherDashboard;
