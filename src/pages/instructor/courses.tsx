import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiUsers, FiDollarSign, FiStar, FiFilter, FiSearch, FiZap, FiActivity, FiLayers, FiShield, FiTrendingUp, FiBookOpen, FiClock } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { useRouter } from 'next/router';
import { AuthenticatedPage } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCourses, deleteCourse } from '@/store/slices/courseSlice';

interface CourseNode {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  revenue: number;
  status: 'active' | 'draft' | 'review';
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

const TeacherCoursesPage: AuthenticatedPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'review'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const dispatch = useAppDispatch();
  const { courses: fetchedCourses } = useAppSelector((state) => state.courses);

  const [courses, setCourses] = useState<any[]>([]);
  const { isInitialized, token } = useAppSelector(state => state.auth);

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const t = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/instructor/courses`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await response.json();
        if (result.success) {
          const mapped = result.data.map((c: any) => ({
            id: c._id,
            title: c.title,
            description: c.description || '',
            thumbnail: c.thumbnail || '/course-1.jpg',
            price: c.price || 0,
            studentsCount: c.studentsCount || 0,
            rating: c.rating || 0,
            reviewsCount: 0,
            revenue: c.price ? c.price * (c.studentsCount || 0) : 0,
            status: c.isPublished ? 'active' : 'draft',
            category: c.category || 'Development',
            level: c.level || 'intermediate',
            createdAt: new Date(c.createdAt).toLocaleDateString()
          }));
          setCourses(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch instructor courses:', error);
      }
    };

    if (isInitialized && (token || localStorage.getItem('token'))) {
      fetchInstructorCourses();
    }
  }, [isInitialized, token]);

  const handlePublish = async (courseId: string) => {
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}` 
        },
        body: JSON.stringify({ isPublished: true })
      });
      const result = await response.json();
      if (result.success) {
        alert('Course is now LIVE for all students!');
        // Update local state
        setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'active' } : c));
      }
    } catch (error) {
      console.error('Failed to publish course:', error);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Page Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl md:rounded-3xl p-6 md:p-8 xl:p-12 text-white border border-white/5 shadow-2xl group flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-4 text-center xl:text-left flex-1">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <FiBookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Course Management</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Courses</span>
            </h1>
            
            <p className="text-sm text-gray-400 max-w-2xl font-medium leading-relaxed">
              Manage your curriculum, track performance, and engage with your students across all active courses.
            </p>
          </div>

          <div className="w-full xl:w-auto relative z-10">
            <Button 
              onClick={() => router.push('/instructor/create-course')}
              className="w-full xl:w-auto px-8 py-4 rounded-xl group/btn text-[10px] uppercase font-black tracking-widest"
              variant="primary"
            >
              <FiPlus className="mr-2 h-5 w-5 group-hover/btn:rotate-90 transition-transform" />
              Create New Course
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Courses', value: courses.length, icon: FiLayers, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Total Students', value: courses.reduce((acc, c) => acc + c.studentsCount, 0).toLocaleString(), icon: FiUsers, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Total Revenue', value: `$${courses.reduce((acc, c) => acc + c.revenue, 0).toLocaleString()}`, icon: FiActivity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Avg Rating', value: '4.8', icon: FiStar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all shadow-xl group">
               <div className="flex items-center space-x-4">
                 <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border border-white/5 transition-transform group-hover:scale-110 shadow-inner`}>
                   <stat.icon className="h-5 w-5" />
                 </div>
                 <div className="space-y-0.5">
                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">{stat.label}</div>
                   <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-xl">
            <div className="flex-1 relative group w-full">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-all" />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/5 py-3.5 pl-14 pr-6 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/30 transition-all"
              />
            </div>
            <div className="w-full md:w-64 relative">
                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/5 py-3.5 pl-12 pr-10 rounded-xl text-xs font-bold uppercase tracking-widest text-white focus:outline-none focus:border-emerald-500/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">ALL STATUS</option>
                  <option value="active">ONLINE</option>
                  <option value="draft">DRAFT</option>
                  <option value="review">IN REVIEW</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-white/30 pointer-events-none" />
            </div>
        </div>

        {/* Course Cards */}
        {/* Course Table */}
        <div className="bg-gray-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          {/* Table Header - Hidden on small screens */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <div className="col-span-4">Course Info</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Students</div>
            <div className="col-span-1 text-center">Rating</div>
            <div className="col-span-1 text-center">Revenue</div>
            <div className="col-span-1 text-center">Price</div>
            <div className="col-span-3 text-right pr-4">Actions</div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredCourses.length > 0 ? (
              filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((course) => (
                <div key={course.id} className="group hover:bg-white/[0.02] transition-all">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 lg:px-8 py-6 items-center">
                    
                    {/* Column 1: Course Info */}
                    <div className="col-span-1 lg:col-span-4 flex items-center gap-5">
                      <div className="relative w-20 h-14 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-black shadow-lg group-hover:border-emerald-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent z-0" />
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <FiLayers className="h-6 w-6 text-white" />
                          </div>
                        )}
                        {/* Mobile Status Badge */}
                        <div className="absolute top-1.5 left-1.5 z-20 lg:hidden">
                           <div className={`w-2 h-2 rounded-full shadow-lg ${
                             course.status === 'active' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-gray-600 shadow-gray-600/50'
                           }`} />
                        </div>
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors truncate">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-none">
                          <span>{course.category}</span>
                          <span className="opacity-30 self-center">/</span>
                          <span className="capitalize">{course.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Status (Desktop) */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                      <div className="relative group/badge">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          course.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-gray-900/80 text-gray-500 border-white/10'
                        }`}>
                          {course.status}
                        </span>
                        {/* Quick Publish for Drafts */}
                        {course.status === 'draft' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePublish(course.id); }}
                            className="absolute inset-0 opacity-0 group-hover/badge:opacity-100 bg-emerald-500 text-white rounded-full flex items-center justify-center transition-opacity shadow-lg"
                          >
                            <FiZap className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Students */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                       <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
                          <FiUsers className="h-3.5 w-3.5 text-gray-600" />
                          <span className="text-xs font-bold">{course.studentsCount.toLocaleString()}</span>
                       </div>
                    </div>

                    {/* Column 4: Rating */}
                    <div className="hidden lg:flex col-span-1 justify-center">
                       <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-white transition-colors">
                          <FiStar className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                          <span className="text-xs font-bold">{course.rating}</span>
                       </div>
                    </div>

                    {/* Column 5: Revenue */}
                    <div className="col-span-2 lg:col-span-1 flex lg:justify-center items-baseline gap-2">
                       <span className="lg:hidden text-[8px] font-bold text-gray-600 uppercase tracking-widest">Revenue:</span>
                       <span className="text-sm font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                         ${course.revenue.toLocaleString()}
                       </span>
                    </div>

                    {/* Column 6: Price */}
                    <div className="col-span-2 lg:col-span-1 flex lg:justify-center items-baseline gap-2">
                       <span className="lg:hidden text-[8px] font-bold text-gray-600 uppercase tracking-widest">Price:</span>
                       <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                         ${course.price}
                       </span>
                    </div>

                    {/* Column 7: Actions */}
                    <div className="col-span-1 lg:col-span-3 flex justify-end gap-2 pr-0 lg:pr-2">
                      <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 border border-white/5 opacity-80 group-hover:opacity-100 group-hover:border-emerald-500/20 transition-all">
                        <button 
                          onClick={() => router.push(`/student/learning/${course.id}`)} 
                          title="View Course"
                          className="p-2.5 rounded-lg active:scale-90 bg-white/5 hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all border border-transparent"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => router.push(`/instructor/create-course?id=${course.id}`)} 
                          title="Edit Course"
                          className="p-2.5 rounded-lg active:scale-90 bg-white/5 hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-400 transition-all border border-transparent"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Are you sure you want to delete this course?')) dispatch(deleteCourse(course.id)) }} 
                          title="Delete Course"
                          className="p-2.5 rounded-lg active:scale-90 bg-white/5 hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 transition-all border border-transparent"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                        <div className="w-[1px] h-4 bg-white/10 mx-1 hidden lg:block" />
                        <button 
                          onClick={() => router.push(`/instructor/analytics?courseId=${course.id}`)}
                          className="hidden lg:flex p-2.5 rounded-lg active:scale-90 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all border border-transparent"
                          title="Detailed Analytics"
                        >
                          <FiTrendingUp className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-gray-900/40 border border-t-0 border-white/5 border-dashed">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <FiLayers className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Courses Found</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8 text-xs underline-offset-4 decoration-emerald-500/50 uppercase tracking-widest px-10">
                  Search keyword or filter status did not match any of your courses.
                </p>
                <Button 
                  onClick={() => router.push('/instructor/create-course')}
                  variant="primary"
                  className="rounded-xl px-12 py-4 h-auto text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20"
                >
                  Create New Course
                </Button>
              </div>
            )}
          </div>
        </div>

        {filteredCourses.length > itemsPerPage && (
          <div className="flex justify-center mt-10">
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCourses.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

TeacherCoursesPage.allowedRoles = ['instructor', 'admin'];
export default TeacherCoursesPage;
