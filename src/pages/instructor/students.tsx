import React, { useState, useMemo, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiMail, FiBook, FiBarChart, FiAward, 
  FiMessageSquare, FiMoreVertical, FiActivity, FiZap, 
  FiRadio, FiShield, FiUserCheck, FiUsers, FiTrendingUp, FiStar 
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAppSelector } from '@/hooks/useRedux';
import { useRouter } from 'next/router';
import Pagination from '@/components/ui/Pagination';
import { AuthenticatedPage } from '@/types';

const StudentManagementPage: AuthenticatedPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, progress: 75, engagement: 92, rating: 4.8 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { isInitialized, token } = useAppSelector(state => state.auth);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const t = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/students`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await response.json();
        if (result.success) {
          setStudents(result.data);
          // Simple stats calculation
          setStats(prev => ({
            ...prev,
            active: result.data.length,
            engagement: result.data.length > 0 ? 94 : 0
          }));
        }
      } catch (error) {
        console.error('Students Fetch Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized && (token || localStorage.getItem('token'))) {
      fetchStudents();
    }
  }, [isInitialized, token]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === 'All' || student.course === filterCourse;
      const matchesStatus = filterStatus === 'All' || student.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, searchTerm, filterCourse, filterStatus]);

  const courseList = useMemo(() => {
    return Array.from(new Set(students.map(s => s.course)));
  }, [students]);

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-8 md:p-12 text-white border border-white/5 shadow-2xl group flex flex-col xl:flex-row items-center justify-between gap-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-indigo-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-6 text-center xl:text-left flex-1">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              <FiUsers className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Classroom Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-tight">
              Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Insights</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-sm font-medium leading-relaxed mx-auto xl:mx-0">
              Track student engagement, performance metrics, and learning trajectories across your entire course catalog.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 w-full xl:w-auto">
            {[
              { label: 'Active Students', value: stats.active, icon: FiActivity, color: 'text-indigo-400' },
              { label: 'Avg Progress', value: `${stats.progress}%`, icon: FiTrendingUp, color: 'text-emerald-400' },
              { label: 'Engagement', value: `${stats.engagement}%`, icon: FiZap, color: 'text-amber-400' },
              { label: 'Avg Rating', value: stats.rating, icon: FiStar, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all shadow-xl group/card">
                <stat.icon className={`h-4 w-4 ${stat.color} mb-3 group-hover/card:scale-110 transition-transform`} />
                <div className="text-2xl font-black text-white italic tracking-tighter leading-none mb-1">{stat.value}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 group w-full">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME OR EMAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-white/5 rounded-2xl pl-14 pr-6 py-4 xl:py-5 text-[10px] font-bold text-white uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all shadow-xl placeholder:text-gray-700"
            />
          </div>
          
          <div className="relative w-full lg:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-3 px-8 py-4 xl:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl w-full lg:w-auto justify-center ${showFilters ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-gray-950 text-gray-400 border border-white/5 hover:border-indigo-500/30'}`}
            >
              <FiFilter className={showFilters ? 'animate-pulse' : ''} />
              <span>Advanced Filters</span>
            </button>

            {showFilters && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-gray-950 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Filter by Course</label>
                    <select 
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="All">All Courses</option>
                      {courseList.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Filter by Status</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
                    </select>
                  </div>

                  {/* Reset Button */}
                  {(filterCourse !== 'All' || filterStatus !== 'All') && (
                    <button 
                      onClick={() => { setFilterCourse('All'); setFilterStatus('All'); }}
                      className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-300 mt-2 py-2"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Data Table */}
        <div className="bg-gray-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative w-full border-t flex flex-col min-w-0 min-h-[400px]">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Classroom Data...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/5">
                      <th className="px-4 xl:px-6 py-4 xl:py-5 text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Student</th>
                      <th className="hidden lg:table-cell px-4 xl:px-6 py-4 xl:py-5 text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Course</th>
                      <th className="hidden sm:table-cell px-4 xl:px-6 py-4 xl:py-5 text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Progress</th>
                      <th className="hidden xl:table-cell px-4 xl:px-6 py-4 xl:py-5 text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Joined At</th>
                      <th className="hidden 2xl:table-cell px-4 xl:px-6 py-4 xl:py-5 text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Performance</th>
                      <th className="px-4 xl:px-6 py-4 xl:py-5 text-center text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((student) => (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-all group">
                        <td className="px-4 xl:px-8 py-4 xl:py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3 xl:space-x-4">
                            <div className="relative">
                              {student.avatar ? (
                                <img src={student.avatar} className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-all shadow-xl" />
                              ) : (
                                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-all shadow-xl">
                                    <span className="text-white text-base xl:text-lg font-black">{student.name[0]}</span>
                                </div>
                              )}
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 xl:w-3.5 xl:h-3.5 rounded-full border-2 border-gray-950 shadow-lg ${student.status === 'active' ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-xs xl:text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[120px] sm:max-w-none">{student.name}</div>
                              <div className="text-[9px] xl:text-[10px] font-medium text-gray-500 truncate max-w-[120px] sm:max-w-none">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-4 xl:px-6 py-4 xl:py-5 whitespace-nowrap">
                          <span className="px-2.5 py-1 xl:px-3 rounded-lg bg-white/5 border border-white/5 text-[9px] xl:text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate max-w-[200px] inline-block">{student.course}</span>
                        </td>
                        <td className="hidden sm:table-cell px-4 xl:px-6 py-4 xl:py-5 whitespace-nowrap">
                          <div className="w-24 xl:w-32 space-y-1.5">
                            <div className="flex justify-between text-[8px] xl:text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                              <span>{student.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden border border-white/5">
                              <div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${student.progress || 0}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="hidden xl:table-cell px-4 xl:px-6 py-4 xl:py-5 whitespace-nowrap">
                          <span className="text-[10px] xl:text-[11px] font-medium text-gray-500">{new Date(student.joinedAt).toLocaleDateString()}</span>
                        </td>
                        <td className="hidden 2xl:table-cell px-4 xl:px-6 py-4 xl:py-5 whitespace-nowrap">
                          <div className="px-2 py-1 xl:px-2.5 rounded-md border shadow-xl inline-flex items-center gap-1.5 xl:gap-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <div className="w-1 h-1 rounded-full bg-emerald-400" />
                            <span className="text-[8px] xl:text-[9px] font-black uppercase tracking-widest">Good Standing</span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 xl:py-5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              className="p-1.5 xl:p-2 bg-white/5 hover:bg-indigo-500 hover:text-white rounded-lg transition-all border border-white/5 text-gray-600" 
                              title="Contact Student"
                              onClick={() => window.location.href = `mailto:${student.email}`}
                            >
                              <FiMail className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                            </button>
                            <button 
                              className="p-1.5 xl:p-2 bg-white/5 hover:bg-cyan-500 hover:text-white rounded-lg transition-all border border-white/5 text-gray-600" 
                              title="View Analytics"
                              onClick={() => router.push(`/instructor/analytics?studentId=${student.id}`)}
                            >
                              <FiBarChart className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length > itemsPerPage && (
                <div className="p-6 border-t border-white/5 bg-black/20">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-24 text-center space-y-4">
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 border-dashed">
                  <FiUsers className="h-8 w-8 text-gray-700" />
               </div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Students Found</h3>
               <p className="text-gray-500 max-w-sm text-sm">You don't have any students enrolled in your courses yet or try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

StudentManagementPage.allowedRoles = ['instructor', 'admin'];
export default StudentManagementPage;
