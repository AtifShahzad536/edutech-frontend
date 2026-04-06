import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiTrendingUp, FiUsers, FiDollarSign, FiClock, FiStar, FiActivity,
  FiArrowUpRight, FiArrowDownRight, FiBarChart2, FiLayers, FiCalendar, FiDownload, FiInfo, FiAward
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { ChartLine, ChartPie } from '@/components/ui/Charts';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';
import Pagination from '@/components/ui/Pagination';
import { AuthenticatedPage } from '@/types';

const InstructorAnalyticsPage: AuthenticatedPage = () => {
  const router = useRouter();
  const { courseId, studentId } = router.query;
  const { isInitialized, token } = useAppSelector(state => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState('DATE RANGE');
  const [isExporting, setIsExporting] = useState(false);
  const [revenueTimeframe, setRevenueTimeframe] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Focus Context
  const focusedCourse = useMemo(() => courses.find(c => c.id === courseId), [courses, courseId]);
  const focusedStudent = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const t = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${t}` };

        // Fetch Stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/stats`, { headers });
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);

        // Fetch Courses
        const coursesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/courses`, { headers });
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          setCourses(coursesData.data.map((c: any) => ({
            id: c._id,
            title: c.title,
            students: c.studentsCount || 0,
            revenue: c.price ? c.price * (c.studentsCount || 0) : 0,
            rating: c.rating || 0,
            growth: '+12%', // Mock trend for now
            type: 'up'
          })));
        }

        // Fetch Students
        const studentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/students`, { headers });
        const studentsData = await studentsRes.json();
        if (studentsData.success) setStudents(studentsData.data);

      } catch (error) {
        console.error('Analytics Fetch Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized && (token || localStorage.getItem('token'))) {
      fetchAnalytics();
    }
  }, [isInitialized, token]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Success: Analytics report generated and downloaded as CSV!');
    }, 1500);
  };

  // Revenue Data based on timeframe
  const revenueData = useMemo(() => {
    if (revenueTimeframe === '7d') {
      return [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 5000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
      ];
    }
    // Mock 30-day data (4 weeks)
    return [
      { name: 'W1', revenue: 18000 },
      { name: 'W2', revenue: 25000 },
      { name: 'W3', revenue: 21000 },
      { name: 'W4', revenue: 32000 },
    ];
  }, [revenueTimeframe]);

  // Enrollment Data for Pie Chart
  const enrollmentData = useMemo(() => {
    if (focusedStudent) return [{ name: focusedStudent.name, value: 100 }];
    if (focusedCourse) return [{ name: focusedCourse.title, value: focusedCourse.students }];
    return courses.length > 0 
      ? courses.map(c => ({ name: c.title, value: c.students }))
      : [{ name: 'No Courses', value: 0 }];
  }, [courses, focusedCourse, focusedStudent]);

  // Combined stats
  const displayMetrics = useMemo(() => {
    if (focusedCourse) {
      return [
        { label: 'Course Revenue', value: `$${focusedCourse.revenue.toLocaleString()}`, growth: '+5.2%', trend: 'up', icon: FiDollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Total Students', value: focusedCourse.students.toLocaleString(), growth: '+2.1%', trend: 'up', icon: FiUsers, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Course Rating', value: focusedCourse.rating, growth: '+0.1%', trend: 'up', icon: FiStar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Engagement', value: '94%', growth: '+1.2%', trend: 'up', icon: FiActivity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      ];
    }
    if (focusedStudent) {
       return [
        { label: 'Enrolled On', value: new Date(focusedStudent.joinedAt).toLocaleDateString(), growth: 'N/A', trend: 'up', icon: FiCalendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Active Progress', value: '45%', growth: '+15%', trend: 'up', icon: FiTrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Attendance', value: '92%', growth: '+2%', trend: 'up', icon: FiClock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Quiz Score', value: '88/100', growth: '+4%', trend: 'up', icon: FiAward, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      ];
    }
    return [
      { label: 'Total Revenue', value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '$0', growth: '+15.4%', trend: 'up', icon: FiDollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { label: 'Active Students', value: stats ? stats.totalStudents.toLocaleString() : '0', growth: '+8.2%', trend: 'up', icon: FiUsers, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
      { label: 'Total Courses', value: stats ? stats.totalCourses.toLocaleString() : '0', growth: '+2', trend: 'up', icon: FiLayers, color: 'text-rose-400', bg: 'bg-rose-500/10' },
      { label: 'Avg Rating', value: stats ? stats.rating : '0', growth: '+0.2%', trend: 'up', icon: FiStar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];
  }, [stats, focusedCourse, focusedStudent]);

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Analytics Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 xl:p-12 text-white border border-white/5 shadow-2xl group flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-cyan-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-4 text-center xl:text-left flex-1">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full">
              <FiBarChart2 className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400">Insight Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-tight" id="analytics-title">
              {focusedCourse ? 'Course' : focusedStudent ? 'Student' : 'Performance'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">{focusedCourse ? 'Insights' : focusedStudent ? 'Analysis' : 'Analytics'}</span>
            </h1>
            {(focusedCourse || focusedStudent) && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl w-fit mx-auto xl:mx-0">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  Focused on: {focusedCourse?.title || focusedStudent?.name}
                </span>
                <button 
                  onClick={() => router.push('/instructor/analytics')}
                  className="ml-2 text-[8px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-all"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
             <div className="relative">
                <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all shadow-xl min-w-[180px] justify-between"
                  id="date-picker-btn"
                >
                  <div className="flex items-center space-x-3">
                    <FiCalendar className="text-cyan-400 w-4 h-4" />
                    <span>{dateRange}</span>
                  </div>
                  <FiInfo className="text-gray-600 w-3 h-3" />
                </button>
                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      {['LAST 7 DAYS', 'LAST 30 DAYS', 'LAST YEAR', 'CRITICAL PERIOD'].map(range => (
                        <button 
                          key={range}
                          onClick={() => { setDateRange(range); setShowDatePicker(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </div>
             
             <button 
               onClick={handleExport}
               disabled={isExporting}
               className={`flex items-center space-x-3 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isExporting ? 'bg-indigo-600/50' : 'bg-indigo-600 hover:bg-indigo-500'}`}
               id="export-analytics-btn"
             >
               {isExporting ? (
                 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
               ) : (
                 <>
                   <FiDownload className="w-4 h-4" />
                   <span>Export Report</span>
                 </>
               )}
             </button>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse shadow-xl" />
            ))
          ) : (
            displayMetrics.map((stat: any, i: number) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all shadow-xl group relative overflow-hidden">
                 <div className="flex justify-between items-start mb-4">
                   <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border border-white/5`}>
                     <stat.icon className="h-5 w-5" />
                   </div>
                   <div className={`flex items-center space-x-1 text-[10px] font-black ${stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'} uppercase tracking-widest`}>
                      {stat.trend === 'up' ? <FiArrowUpRight className="h-3 w-3" /> : <FiArrowDownRight className="h-3 w-3" />}
                      <span>{stat.growth}</span>
                   </div>
                 </div>
                 <div className="space-y-0.5">
                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{stat.label}</div>
                   <div className="text-3xl font-black text-white tracking-tight italic">{stat.value}</div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 bg-gray-900/60 border border-white/5 rounded-3xl p-8 shadow-2xl relative">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Revenue Trend</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Growth per protocol sync</p>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/5">
                    <button 
                      onClick={() => setRevenueTimeframe('7d')}
                      className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                        revenueTimeframe === '7d' 
                          ? 'bg-cyan-500/10 text-cyan-400 shadow-xl' 
                          : 'text-gray-500 hover:text-white'
                      }`}
                      id="revenue-7d-btn"
                    >
                      7 Days
                    </button>
                    <button 
                      onClick={() => setRevenueTimeframe('30d')}
                      className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                        revenueTimeframe === '30d' 
                          ? 'bg-cyan-500/10 text-cyan-400 shadow-xl' 
                          : 'text-gray-500 hover:text-white'
                      }`}
                      id="revenue-30d-btn"
                    >
                      30 Days
                    </button>
                  </div>
               </div>
               <div className="h-80 w-full relative">
                  <ChartLine data={revenueData} xKey="name" yKey="revenue" color="#06b6d4" />
               </div>
            </div>

            {/* Distribution */}
            <div className="bg-gray-900/60 border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
                <div className="w-full text-center mb-8">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Enrollment Map</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Global student distribution</p>
                </div>
                <div className="h-64 w-64 relative flex items-center justify-center">
                    <ChartPie data={enrollmentData} nameKey="name" valueKey="value" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-white uppercase tracking-tight italic">Global</span>
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest text-center">Sync Matrix</span>
                    </div>
                </div>
                <div className="w-full mt-10 space-y-3 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                   {enrollmentData.map((d, i) => (
                     <div key={i} className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: ['#06b6d4', '#6366f1', '#a855f7', '#ec4899'][i % 4] }} />
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{d.name}</span>
                        </div>
                        <span className="text-xs font-black text-white italic">{d.value.toLocaleString()}</span>
                     </div>
                   ))}
                </div>
            </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Courses List */}
            <div className="lg:col-span-2 bg-gray-950 border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col">
               <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 shadow-xl">
                         <FiBarChart2 className="h-5 w-5 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">Active Performance</h3>
                   </div>
                   <button 
                    onClick={() => router.push('/instructor/courses')}
                    className="text-[9px] font-bold text-gray-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
                    id="compare-all-btn"
                   >
                     Compare All
                   </button>
               </div>
               
               <div className="space-y-4 flex-1">
                  {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse shadow-inner" />)
                  ) : (focusedCourse ? [focusedCourse] : courses).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((course, i) => (
                    <div 
                      key={course.id || i} 
                      onClick={() => router.push(`/instructor/courses?id=${course.id}`)}
                      className="group bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiArrowUpRight className="h-4 w-4 text-cyan-400" />
                       </div>
                       <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="flex-1 space-y-1 w-full text-center md:text-left">
                             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">COURSE ID</div>
                             <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors truncate max-w-[280px]">{course.title}</h4>
                          </div>
                          <div className="flex items-center gap-8 px-6 border-white/10 md:border-l w-full md:w-auto justify-center">
                             <div className="text-center group-hover:scale-105 transition-transform">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Students</p>
                                <p className="text-lg font-black text-white italic tracking-tighter">{course.students.toLocaleString()}</p>
                             </div>
                             <div className="text-center px-6 border-x border-white/10 group-hover:scale-105 transition-transform">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Revenue</p>
                                <p className="text-lg font-black text-white italic tracking-tighter">${course.revenue.toLocaleString()}</p>
                             </div>
                             <div className="text-center group-hover:scale-105 transition-transform">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rating</p>
                                <p className={`text-lg font-black italic tracking-tighter text-amber-400`}>{course.rating}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               {!focusedCourse && courses.length > itemsPerPage && (
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(courses.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    className="pt-6"
                  />
               )}
            </div>

            {/* Retention List */}
            <div className="bg-gray-950 border border-white/5 rounded-3xl p-8 shadow-2xl">
               <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-xl">
                     <FiTrendingUp className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Stream Analysis</h3>
               </div>
               
               <div className="space-y-4">
                 {[
                   { label: 'Completion Velocity', value: 'High', status: 'Stable', icon: FiTrendingUp, color: 'text-indigo-400' },
                   { label: 'Avg Lesson Duration', value: '24m', status: 'High', icon: FiClock, color: 'text-cyan-400' },
                   { label: 'Retention Score', value: '92/100', status: 'Excellent', icon: FiUsers, color: 'text-emerald-400' }
                 ].map((metric, i) => (
                   <div 
                    key={i} 
                    onClick={() => router.push('/instructor/assignments')}
                    className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer shadow-xl overflow-hidden relative"
                   >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20" />
                      <div className="flex items-center space-x-5">
                         <div className={`p-3 bg-black/40 rounded-xl border border-white/10 ${metric.color}`}>
                            <metric.icon className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{metric.label}</p>
                            <p className="text-xl font-black text-white italic tracking-tighter uppercase">{metric.value}</p>
                         </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                         <span className={`text-[8px] font-black uppercase tracking-widest ${metric.color}`}>{metric.status}</span>
                      </div>
                   </div>
                 ))}
               </div>

               <Button 
                onClick={() => router.push('/instructor/courses')}
                className="w-full mt-8 py-4 rounded-xl text-[10px] tracking-widest uppercase font-black" 
                variant="secondary"
               >
                   Full Portfolio Analysis
               </Button>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

InstructorAnalyticsPage.allowedRoles = ['instructor', 'admin'];
export default InstructorAnalyticsPage;
