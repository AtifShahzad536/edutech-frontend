import React, { useState, useMemo, memo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiFilter, FiGrid, FiList, FiPlay, FiUsers, FiBookOpen, FiAward, FiArrowRight, FiArrowLeft, FiCheck, FiStar, FiHeart, FiTrendingUp, FiClock, FiZap, FiCpu, FiLayers, FiActivity, FiShield } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CourseCard from '@/components/ui/CourseCard';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { useAuthSync } from '@/hooks/useAuthSync';
import { fetchCourses } from '@/store/slices/courseSlice';
import { AuthenticatedPage } from '@/types';

const BrowseCoursesPage: AuthenticatedPage = () => {
  const router = useRouter();
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);
  useAuthSync();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'programming', label: 'Programming' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'development', label: 'Development' },
  ];

  const dispatch = useAppDispatch();
  const { courses: fetchedCourses } = useAppSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const availableCourses = useMemo(() => {
    return fetchedCourses.map(c => ({
      id: c._id || c.id,
      title: c.title,
      description: c.description || '',
      thumbnail: c.thumbnail || '',
      instructor: c.instructor?.firstName ? `${c.instructor.firstName} ${c.instructor.lastName}` : 'System Admin',
      category: c.category?.toLowerCase() || 'programming',
      difficulty: c.level ? c.level.charAt(0).toUpperCase() + c.level.slice(1) : 'Beginner',
      students: c.studentsCount || 0,
      rating: c.rating || 0,
      price: c.price ? `$${c.price.toFixed(2)}` : 'Free'
    }));
  }, [fetchedCourses]);

  const filteredCourses = availableCourses.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (selectedCategory === 'all' || n.category === selectedCategory)
  );

  return (
    <DashboardLayout>
      <div className="pb-24 space-y-12 animate-in fade-in duration-700">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group min-h-[300px] flex items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-24 -mt-24" />
          
          <div className="max-w-[1536px] w-[92%] mx-auto transition-all duration-500 flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="space-y-6 text-center xl:text-left flex-1">
              <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full">
                <FiBookOpen className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Course Catalog</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none text-white">
                Course <span className="text-indigo-500">Catalog</span>
              </h1>
              <p className="text-lg text-gray-400 font-medium max-w-2xl leading-relaxed mx-auto xl:mx-0">
                Explore our professional courses and start learning the skills you need today.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
               <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 text-center min-w-[180px]">
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2">COURSES</p>
                  <p className="text-3xl font-bold text-white tracking-tight">1,420</p>
               </div>
               <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 text-center min-w-[180px]">
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2">LEARNERS</p>
                  <p className="text-3xl font-bold text-indigo-400 tracking-tight">27.8M</p>
               </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-2xl">
           <div className="flex flex-col xl:flex-row gap-6 items-center">
              <div className="flex-1 relative group w-full">
                 <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                 <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for courses..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-14 pr-6 text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-all"
                 />
              </div>
              <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-center">
                 {categories.map(cat => (
                    <button
                       key={cat.value}
                       onClick={() => setSelectedCategory(cat.value)}
                       className={`px-6 py-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                          selectedCategory === cat.value 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                          : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-white'
                       }`}
                    >
                       {cat.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Courses Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnail={course.thumbnail}
                  category={course.category}
                  level={course.difficulty}
                  instructor={course.instructor}
                  rating={course.rating}
                  studentsCount={course.students}
                  price={course.price}
                  href={`/student/courses/${course.id}`}
                  onAction={() => router.push(`/student/courses/${course.id}`)}
                  actionLabel="View Course"
                  actionIcon={<FiArrowRight className="h-4 w-4" />}
                />
             ))}
         </div>
      </div>
    </DashboardLayout>
  );
};

BrowseCoursesPage.allowedRoles = ['student', 'instructor', 'admin'];
export default BrowseCoursesPage;
