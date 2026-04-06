import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FiSearch, FiGrid, FiList, FiPlay, FiUsers, FiStar,
  FiClock, FiBookOpen, FiAward, FiArrowRight, FiZap,
  FiLoader, FiAlertCircle, FiCheckCircle, FiShoppingCart, FiLayers
} from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import CourseCard from '@/components/ui/CourseCard';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { addToCart } from '@/store/slices/courseSlice';
import API from '@/config/api';

// ─── Skeleton card ────────────────────────────────────────────────────────────
const CourseCardSkeleton = () => (
  <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-white/5" />
    <div className="p-6 space-y-4">
      <div className="h-5 bg-white/5 rounded-lg w-3/4" />
      <div className="h-4 bg-white/5 rounded-lg w-full" />
      <div className="h-4 bg-white/5 rounded-lg w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-white/5 rounded-lg w-16" />
        <div className="h-10 bg-white/5 rounded-xl w-28" />
      </div>
    </div>
  </div>
);

const categories = [
  { value: 'all',          label: 'All Categories' },
  { value: 'Development',  label: 'Development' },
  { value: 'Design',       label: 'Design' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Business',     label: 'Business' },
  { value: 'Marketing',    label: 'Marketing' },
];

const levels = [
  { value: 'all',          label: 'All Levels' },
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
];

const CoursesPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.courses);

  const [courses, setCourses]           = useState<any[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [enrollingId, setEnrollingId]   = useState<string | null>(null);
  const [enrolledMsg, setEnrolledMsg]   = useState<string | null>(null);

  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel]       = useState('all');
  const [viewMode, setViewMode]                 = useState<'grid' | 'list'>('grid');
  const [page, setPage]                         = useState(1);

  const searchTimeout = useRef<NodeJS.Timeout>();

  // ── Sync category from URL query ────────────────────────────────────────────
  useEffect(() => {
    if (router.isReady) {
      const cat = router.query.cat as string;
      if (cat) setSelectedCategory(cat);
    }
  }, [router.isReady, router.query.cat]);

  // ── Fetch courses from real API ──────────────────────────────────────────────
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm)          params.set('q', searchTerm);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedLevel !== 'all')    params.set('level', selectedLevel);
        params.set('page', String(page));
        params.set('limit', '12');

        const res = await fetch(`${API}/courses?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setCourses(data.data || []);
          setTotalCourses(data.total || 0);
        } else {
          setError('Failed to load courses.');
        }
      } catch (err) {
        setError('Could not connect to the server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchCourses, searchTerm ? 400 : 0);
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, selectedCategory, selectedLevel, page]);

  // ── Check enrollment status ──────────────────────────────────────────────────
  const isEnrolled = useCallback((courseId: string) => {
    return user?.enrolledCourses?.some((c: any) =>
      String(c._id || c) === String(courseId)
    ) ?? false;
  }, [user]);

  const isInCart = useCallback((courseId: string) => {
    return cart.includes(courseId);
  }, [cart]);

  // ── Handle enroll / cart action ─────────────────────────────────────────────
  const handleEnroll = useCallback(async (course: any) => {
    const courseId = course._id || course.id;

    // Already enrolled → go to course
    if (isEnrolled(courseId)) {
      router.push(`/student/learn/${courseId}`);
      return;
    }

    // Not logged in
    if (!token) {
      router.push(`/login?redirect=/courses`);
      return;
    }

    // Free course — direct enrollment
    if (course.price === 0) {
      setEnrollingId(courseId);
      try {
        const res = await fetch(`${API}/courses/${courseId}/enroll-free`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setEnrolledMsg(`Enrolled in "${course.title}"! 🎉`);
          setTimeout(() => setEnrolledMsg(null), 4000);
          router.push(`/student/learn/${courseId}`);
        } else {
          setError(data.message || 'Enrollment failed.');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setEnrollingId(null);
      }
      return;
    }

    // Paid course → add to cart and go to checkout
    dispatch(addToCart(courseId));
    router.push('/checkout');
  }, [token, router, isEnrolled, dispatch]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setPage(page);
  };

  const hasFilters = searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all';
  const selectCls = "bg-gray-900 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer";

  return (
    <PublicLayout>
      <div className="bg-gray-950 min-h-screen">

        {/* ── Toast ──────────────────────────────────────────────────────────── */}
        {enrolledMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <FiCheckCircle className="h-5 w-5 shrink-0" />
            <span className="font-bold text-sm">{enrolledMsg}</span>
          </div>
        )}

        {/* ── Page Header ────────────────────────────────────────────────────── */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Course Library</p>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Find the Right<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Course for You</span>
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Browse expert-taught courses and learn at your own pace. Real skills, real results.
                </p>
              </div>

              {/* Live Stats */}
              <div className="flex gap-4">
                {[
                  { icon: FiBookOpen, val: loading ? '—' : `${totalCourses}+`, label: 'Courses' },
                  { icon: FiUsers, val: '45K+', label: 'Students' },
                  { icon: FiAward, val: '150+', label: 'Instructors' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-900/60 border border-white/5 rounded-2xl p-4 text-center min-w-[90px]">
                    <s.icon className="h-4 w-4 text-indigo-400 mx-auto mb-1.5" />
                    <div className="text-lg font-black text-white">{s.val}</div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-3 mt-10">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setSelectedCategory(cat.value); setPage(1); }}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                      : 'bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sticky Filter Bar ───────────────────────────────────────────────── */}
        <div className="sticky top-16 z-30 bg-gray-950/95 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Level filter */}
                <select
                  value={selectedLevel}
                  onChange={e => { setSelectedLevel(e.target.value); setPage(1); }}
                  className={selectCls}
                >
                  {levels.map(l => <option key={l.value} value={l.value} className="bg-gray-900">{l.label}</option>)}
                </select>

                {/* View toggle */}
                <div className="flex items-center bg-gray-900 border border-white/10 rounded-xl p-1 gap-0.5">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                    <FiGrid className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                    <FiList className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Clear filters */}
                {hasFilters && (
                  <button onClick={resetFilters} className="text-xs text-gray-500 hover:text-white transition-colors underline whitespace-nowrap">
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Course Grid ─────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
          {/* Result count + error */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading...' : (
                <>Showing <span className="text-white font-bold">{courses.length}</span> of <span className="text-white font-bold">{totalCourses}</span> courses</>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400">
              <FiAlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-xs underline hover:no-underline">Dismiss</button>
            </div>
          )}

          {/* Skeletons while loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <CourseCardSkeleton key={i} />)}
            </div>
          )}

          {/* Courses */}
          {!loading && courses.length > 0 && (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
            }>
              {courses.map(course => {
                const courseId = course._id || course.id;
                const enrolled = isEnrolled(courseId);
                const inCart = isInCart(courseId);
                const isFree = course.price === 0;
                const instructor = course.instructorId;
                const instructorName = instructor
                  ? `${instructor.firstName} ${instructor.lastName}`
                  : 'Expert Instructor';

                return (
                  <CourseCard
                    key={courseId}
                    id={courseId}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    category={course.category}
                    level={course.level}
                    instructor={instructorName}
                    rating={course.rating}
                    studentsCount={course.studentsCount}
                    duration={course.duration ? `${course.duration}h` : undefined}
                    price={isFree ? 'Free' : `$${course.price}`}
                    originalPrice={course.originalPrice ? `$${course.originalPrice}` : undefined}
                    isEnrolled={enrolled}
                    isInCart={inCart}
                    variant={viewMode}
                    onAction={() => handleEnroll(course)}
                    actionLabel={
                      enrollingId === courseId ? "Loading..." :
                        enrolled ? "Continue" :
                          inCart ? "In Cart" :
                            isFree ? "Enroll Free" : "Enroll Now"
                    }
                    actionIcon={
                      enrollingId === courseId ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> :
                        enrolled ? <FiPlay className="h-3.5 w-3.5" /> :
                          inCart ? <FiShoppingCart className="h-3.5 w-3.5" /> :
                            isFree ? <FiZap className="h-3.5 w-3.5" /> :
                              <FiShoppingCart className="h-3.5 w-3.5 rotate-[-5deg]" />
                    }
                  />
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && courses.length === 0 && !error && (
            <div className="text-center py-24 space-y-5">
              <div className="w-16 h-16 bg-gray-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto">
                <FiSearch className="h-7 w-7 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white">No Courses Found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
              <button
                onClick={resetFilters}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalCourses > 12 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(totalCourses / 12)) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    page === p
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalCourses / 12)}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* ── CTA Section ────────────────────────────────────────────────────── */}
        <section className="py-20 px-5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-3xl mx-auto relative text-center">
            <div className="bg-gray-900 border border-white/5 rounded-3xl p-12 md:p-16 space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Join 45,000+ Active Students
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-white leading-tight">
                Not Sure Where <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">To Start?</span>
              </h2>
              <p className="text-gray-400 font-medium">
                Get personalized course recommendations based on your goals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-wider text-[11px] transition-all shadow-xl flex items-center gap-2 justify-center">
                    Create Free Account <FiArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-10 py-4 rounded-2xl font-black uppercase tracking-wider text-[11px] transition-all">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default CoursesPage;
