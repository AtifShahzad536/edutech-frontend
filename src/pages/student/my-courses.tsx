import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  FiSearch, FiBookOpen, FiClock, FiAward, FiArrowRight, 
  FiMenu, FiFilter, FiCheckCircle, FiPlay, FiLayers, FiZap 
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CourseCard from '@/components/ui/CourseCard';
import axios from 'axios';
import API_URL from '@/config/api';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { AuthenticatedPage } from '@/types';

const MyCoursesPage: AuthenticatedPage = () => {
  const router = useRouter();
  const { user, token } = useAppSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);

  // ── Sync with local storage or API ──────────────────────────────────────────
  useEffect(() => {
    const loadMyCourses = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          // Format data for CourseCard
          const enrolled = (response.data.enrolledCourses || []).map((c: any) => ({
            id: c.id || c._id,
            title: c.title,
            description: c.description || '',
            thumbnail: c.thumbnail,
            category: c.category || 'Development',
            progress: c.progress || 0,
            status: c.progress === 100 ? 'completed' : 'ongoing',
            instructor: c.instructor || { firstName: 'Edu', lastName: 'Tech' }
          }));
          setCourses(enrolled);
        }
      } catch (error) {
        console.error('Failed to load enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, [token]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Enrolled', value: courses.length, icon: FiBookOpen, color: 'text-indigo-400' },
    { label: 'Completed', value: courses.filter(c => c.status === 'completed').length, icon: FiCheckCircle, color: 'text-emerald-400' },
    { label: 'Hours Learned', value: '42.5', icon: FiClock, color: 'text-amber-400' },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>My Courses | EduTech Student</title>
      </Head>

      <div className="pb-24 space-y-12 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group min-h-[300px] flex items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-24 -mt-24" />
          
          <div className="max-w-[1536px] w-[92%] mx-auto transition-all duration-500 flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="space-y-6 text-center xl:text-left flex-1">
              <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full">
                <FiBookOpen className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Student Dashboard</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none text-white">
                My <span className="text-indigo-500">Courses</span>
              </h1>
              <p className="text-lg text-gray-400 font-medium max-w-2xl leading-relaxed mx-auto xl:mx-0">
                Continue where you left off and achieve your learning goals.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full xl:w-auto">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 text-center min-w-[140px]">
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2">{s.label}</p>
                  <p className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 relative group w-full">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1-2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your courses..."
                className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-14 pr-6 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/5 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <FiFilter className="h-4 w-4" /> Filter
              </button>
              <button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                All Courses
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCourses.map((node: any) => (
              <CourseCard
                key={node.id}
                id={node.id}
                title={node.title}
                description={node.description}
                thumbnail={node.thumbnail}
                category={node.cluster}
                level="All Levels"
                instructor={`${node.instructor.firstName} ${node.instructor.lastName}`}
                progress={node.progress}
                status={node.status}
                href={node.status === 'completed' ? `/student/certificate/${node.id}` : `/student/learning/${node.id}`}
                onAction={() => router.push(node.status === 'completed' ? `/student/certificate/${node.id}` : `/student/learning/${node.id}`)}
                actionLabel={node.status === 'completed' ? "Certificate" : "Continue"}
                actionIcon={node.status === 'completed' ? <FiAward className="h-3.5 w-3.5" /> : <FiZap className="h-3.5 w-3.5" />}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-950 rounded-2xl border border-white/5 shadow-2xl">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <FiBookOpen className="h-8 w-8 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No courses found</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">
              You haven't enrolled in any courses yet or your search didn't match anything.
            </p>
            <button 
              onClick={() => router.push('/student/courses')}
              className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

MyCoursesPage.allowedRoles = ['student', 'instructor', 'admin'];
export default MyCoursesPage;
