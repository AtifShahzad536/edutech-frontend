import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import CourseCard from '@/components/ui/CourseCard';
import StarRating from '@/components/ui/StarRating';
import { useAppSelector } from '@/hooks/useRedux';
import {
  FiPlay, FiStar, FiUsers, FiBookOpen, FiAward, FiTrendingUp,
  FiCheckCircle, FiArrowRight, FiClock, FiMonitor, FiGlobe, FiZap,
  FiChevronLeft, FiChevronRight, FiLoader
} from 'react-icons/fi';

/* ─── Data ─────────────────────────────────────────────────── */

const heroSlides = [
  {
    id: 1,
    image: '/hero-1.jpg',
    badge: '🚀 Over 45,000 students learning today',
    headline: 'Learn Without',
    highlight: 'Limits',
    sub: 'Access expert-led courses in programming, design, business and more. Learn at your own pace and advance your career.',
    cta: { label: 'Start Learning Free', href: '/courses' },
    ctaSecondary: { label: 'Browse Courses', href: '/courses' },
  },
  {
    id: 2,
    image: '/hero-2.jpg',
    badge: '🎓 Expert instructors from top companies',
    headline: 'Grow Your',
    highlight: 'Career',
    sub: 'Join a global community of learners. Get industry-recognised certificates and the skills employers actually want.',
    cta: { label: 'Explore Courses', href: '/courses' },
    ctaSecondary: { label: 'Create Free Account', href: '/signup' },
  },
  {
    id: 3,
    image: '/hero-3.jpg',
    badge: '🏅 Earn certificates in 150+ subjects',
    headline: 'Build Real',
    highlight: 'Skills',
    sub: 'Learn from hands-on projects and real-world assignments. Build a portfolio that stands out from the crowd.',
    cta: { label: 'Get Started Free', href: '/signup' },
    ctaSecondary: { label: 'View All Courses', href: '/courses' },
  },
];

const categories = ['All', 'Web Development', 'Data Science', 'Design', 'Business', 'Marketing'];

const courses = [
  {
    id: 1, title: 'Complete Web Development Bootcamp', instructor: 'Sarah Wilson',
    rating: 4.8, students: '12,400', duration: '42 hours', level: 'Beginner',
    price: '$89.99', originalPrice: '$149.99', badge: 'Bestseller',
    badgeColor: 'bg-amber-500', category: 'Web Development', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
  },
  {
    id: 2, title: 'Python for Data Science & Machine Learning', instructor: 'Dr. Mike Chen',
    rating: 4.9, students: '18,200', duration: '58 hours', level: 'Intermediate',
    price: '$94.99', originalPrice: '$179.99', badge: 'Top Rated',
    badgeColor: 'bg-indigo-600', category: 'Data Science', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
  },
  {
    id: 3, title: 'UI/UX Design: From Zero to Hero', instructor: 'Jane Roberts',
    rating: 4.7, students: '8,600', duration: '35 hours', level: 'Beginner',
    price: '$79.99', originalPrice: '$129.99', badge: 'New',
    badgeColor: 'bg-emerald-600', category: 'Design', thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5'
  },
  {
    id: 4, title: 'Advanced React & TypeScript Patterns', instructor: 'Alex Thompson',
    rating: 4.9, students: '5,300', duration: '28 hours', level: 'Advanced',
    price: '$99.99', originalPrice: '$199.99', badge: 'Hot',
    badgeColor: 'bg-rose-600', category: 'Web Development', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c'
  },
  {
    id: 5, title: 'Digital Marketing Masterclass 2025', instructor: 'Lisa Park',
    rating: 4.6, students: '21,000', duration: '47 hours', level: 'All Levels',
    price: '$69.99', originalPrice: '$119.99', badge: 'Bestseller',
    badgeColor: 'bg-amber-500', category: 'Marketing', thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a'
  },
  {
    id: 6, title: 'Business Analytics with Excel & SQL', instructor: 'David Kumar',
    rating: 4.8, students: '9,100', duration: '31 hours', level: 'Beginner',
    price: '$74.99', originalPrice: '$139.99', badge: 'Top Rated',
    badgeColor: 'bg-indigo-600', category: 'Business', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'
  },
];

const features = [
  { icon: FiMonitor, title: 'Learn Online, Anytime', desc: 'Study at your own schedule from any device — laptop, tablet, or phone.' },
  { icon: FiUsers, title: 'Expert Instructors', desc: 'Courses taught by real-world professionals with years of industry experience.' },
  { icon: FiAward, title: 'Earn Certificates', desc: 'Get a shareable certificate upon course completion to showcase your skills.' },
  { icon: FiGlobe, title: 'Global Community', desc: 'Join a community of 45,000+ learners from over 150 countries.' },
];

const testimonials = [
  { name: 'Aisha Malik', role: 'Frontend Developer', text: 'I landed my first dev job 3 months after finishing the Web Development bootcamp. The quality of the content is truly exceptional.', rating: 5 },
  { name: 'Carlos Rivera', role: 'Data Analyst', text: 'The Python & Data Science course is the best investment I have made in my career. Practical, up-to-date, and very well structured.', rating: 5 },
  { name: 'Priya Sharma', role: 'Product Designer', text: 'Amazing platform! The UI/UX course gave me all the tools I needed to build my portfolio and get freelance clients within weeks.', rating: 5 },
];

const staticStats = [
  { value: '45K+', label: 'Active Students' },
  { value: '800+', label: 'Courses Available' },
  { value: '150+', label: 'Expert Instructors' },
  { value: '4.9', label: 'Average Rating' },
];

import API_URL from '@/config/api';

/* ─── Sub-components ────────────────────────────────────────── */



/* ─── Page ──────────────────────────────────────────────────── */

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);

  // Real data state
  const [realCourses, setRealCourses] = useState<any[]>([]);
  const [pageStats, setPageStats] = useState(staticStats);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch real data on mount
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          fetch(`${API_URL}/home/stats`),
          fetch(`${API_URL}/home/featured-courses`)
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setPageStats([
              { value: statsData.stats.totalStudents > 1000 ? `${(statsData.stats.totalStudents / 1000).toFixed(0)}K+` : `${statsData.stats.totalStudents}+`, label: 'Active Students' },
              { value: `${statsData.stats.totalCourses}+`, label: 'Courses Available' },
              { value: `${statsData.stats.totalInstructors}+`, label: 'Expert Instructors' },
              { value: '4.9', label: 'Average Rating' },
            ]);
          }
        }

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          if (coursesData.success && coursesData.data.length > 0) {
            setRealCourses(coursesData.data);
          }
        }
      } catch (err) {
        console.warn('Home API not available, using static data');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchHomeData();
  }, []);

  // Normalize real or static course data for display
  const displayCourses = realCourses.length > 0
    ? realCourses.map((c: any) => ({
      id: c.id || c._id,
      title: c.title,
      instructor: c.instructor,
      rating: c.rating,
      studentsCount: (c.studentsCount || 0).toLocaleString(),
      duration: `${c.duration || 0} hours`,
      level: c.level ? c.level.charAt(0).toUpperCase() + c.level.slice(1) : 'All Levels',
      price: `$${(c.price || 0).toFixed(2)}`,
      originalPrice: c.originalPrice ? `$${c.originalPrice.toFixed(2)}` : '',
      category: c.category,
      thumbnail: c.thumbnail,
    }))
    : courses.map((c: any) => ({
      ...c,
      studentsCount: c.students, // map 'students' to 'studentsCount'
    }));

  const uniqueCategories = ['All', ...Array.from(new Set(displayCourses.map((c: any) => c.category)))];

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setTimeout(() => setIsAnimating(false), 1200);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setTimeout(() => setIsAnimating(false), 1200);
  }, [isAnimating]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleEnroll = (courseId: any) => {
    if (token) {
      router.push(`/checkout/${courseId}`);
    } else {
      router.push(`/login?redirect=/checkout/${courseId}`);
    }
  };

  const isEnrolled = useCallback((courseId: any) => {
    if (!user || !user.enrolledCourses) return false;
    return user.enrolledCourses.some((c: any) =>
      String(c._id || c.id || c) === String(courseId)
    );
  }, [user]);

  const filteredCourses = activeCategory === 'All'
    ? displayCourses
    : displayCourses.filter((c: any) => c.category === activeCategory);

  return (
    <PublicLayout>
      <div className="bg-gray-950 text-gray-300">

        {/* ── HERO SLIDER ──────────────────────────────────────── */}
        <section className="relative h-[80vh] md:h-[90vh] min-h-[600px] max-h-[950px] 2xl:max-h-[1100px] overflow-hidden ">
          {/* Slides stack */}
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-[1500ms] cubic-bezier(0.23, 1, 0.32, 1) ${idx === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.15] z-0'
                }`}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/65 to-gray-950/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-gray-950/20" />
            </div>
          ))}

          {/* Content layer & Navigation Arrows */}
          <div className="relative z-20 h-full flex items-center">
            <div className="max-w-[2560px] w-[98%] mx-auto pl-[11%] pr-[5%] relative h-full flex items-center">

              {/* Arrow: Prev (Inside Container) */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 md:w-16 md:h-16 bg-white/5 hover:bg-indigo-600/90 backdrop-blur-3xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-2xl hover:scale-105 active:scale-95 group/btn"
                aria-label="Previous"
              >
                <FiChevronLeft className="h-6 w-6 transition-transform group-hover/btn:-translate-x-1" />
              </button>

              {/* Arrow: Next (Inside Container) */}
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 md:w-16 md:h-16 bg-white/5 hover:bg-indigo-600/90 backdrop-blur-3xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-2xl hover:scale-105 active:scale-95 group/btn"
                aria-label="Next"
              >
                <FiChevronRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-1" />
              </button>

              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 z-20 flex items-center ${idx === currentSlide ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <div className="max-w-xl px-12 space-y-6">
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-3 bg-white/10 backdrop-blur-3xl border border-white/10 px-4 py-2 rounded-full text-xs text-gray-300 font-bold uppercase tracking-widest transition-all duration-1000 delay-[200ms] ${idx === currentSlide
                        ? 'opacity-100 translate-x-0'
                        : `opacity-0 ${direction === 'next' ? '-translate-x-12' : 'translate-x-12'}`
                      }`}>
                      {slide.badge}
                    </div>

                    {/* Headline */}
                    <h1 className={`text-3xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black text-white leading-none tracking-tighter transition-all duration-[1200ms] delay-[400ms] ${idx === currentSlide
                        ? 'opacity-100 translate-x-0'
                        : `opacity-0 ${direction === 'next' ? '-translate-x-20' : 'translate-x-20'}`
                      }`}>
                      {slide.headline}<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
                        {slide.highlight}
                      </span>
                    </h1>

                    {/* Subtitle */}
                    <p className={`text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed font-medium transition-all duration-1000 delay-[600ms] ${idx === currentSlide
                        ? 'opacity-100 translate-x-0'
                        : `opacity-0 ${direction === 'next' ? '-translate-x-12' : 'translate-x-12'}`
                      }`}>
                      {slide.sub}
                    </p>

                    {/* CTAs */}
                    <div className={`flex items-center gap-5 pt-6 transition-all duration-1000 delay-[800ms] ${idx === currentSlide
                        ? 'opacity-100 translate-x-0 scale-100'
                        : `opacity-0 ${direction === 'next' ? '-translate-x-12' : 'translate-x-12'} scale-95`
                      }`}>
                      <Link href={token ? '/dashboard' : slide.cta.href}>
                        <button className="relative group bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-12 py-6 rounded-2xl font-medium uppercase tracking-widest text-xs transition-all shadow-2xl shadow-indigo-500/40 active:scale-95 flex items-center gap-4 overflow-hidden whitespace-nowrap leading-none">
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                          <FiPlay className="h-5 w-5" />
                          {token ? 'Go to Dashboard' : slide.cta.label}
                        </button>
                      </Link>
                      <Link href={token ? '/courses' : slide.ctaSecondary.href}>
                        <button className="bg-white/5 hover:bg-white/10 backdrop-blur-3xl border border-white/10 text-white px-12 py-6 rounded-2xl font-medium uppercase tracking-widest text-xs transition-all flex items-center gap-4 active:scale-95 shadow-xl whitespace-nowrap leading-none">
                          <FiBookOpen className="h-5 w-5 text-indigo-400" />
                          {token ? 'Explore Courses' : slide.ctaSecondary.label}
                        </button>
                      </Link>
                    </div>

                    {/* Trust pills */}
                    <div className="flex flex-wrap gap-6 pt-6">
                      {['No credit card needed', 'Cancel anytime', '30-day guarantee'].map(text => (
                        <div key={text} className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                          <FiCheckCircle className="h-4 w-4 text-emerald-500" />
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot navigation */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (isAnimating) return;
                  setDirection(idx > currentSlide ? 'next' : 'prev');
                  setCurrentSlide(idx);
                }}
                className={`transition-all duration-500 rounded-full ${idx === currentSlide
                    ? 'w-12 h-1.5 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/50'
                  }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Slide counter */}
          <div className="absolute bottom-7 right-6 md:right-12 z-30 text-xs font-bold text-white/50">
            {currentSlide + 1} / {heroSlides.length}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5 z-30">
            <div
              key={`progress-${currentSlide}`}
              className="h-full bg-indigo-500 origin-left"
              style={{ animation: 'heroProgress 5s linear forwards' }}
            />
          </div>

          <style>{`
            @keyframes heroProgress {
              from { width: 0%; }
              to   { width: 100%; }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            .animate-shimmer {
              animation: shimmer 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }
            .cubic-bezier {
              transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
            }
          `}</style>
        </section>

        {/* ── STATS BAR ─────────────────────────────────────────── */}
        <section className="border-y border-white/5 bg-gray-900/50">
          <div className="max-w-[2560px] w-[98%] mx-auto px-5 lg:px-8 py-16 2xl:py-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 2xl:gap-16">
              {pageStats.map((s: { value: string; label: string }, i: number) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED COURSES ──────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-[2560px] w-[98%] mx-auto px-5 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Featured Courses</p>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  What Would You Like <br className="hidden md:block" />to Learn Today?
                </h2>
              </div>
              <Link href="/courses">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group">
                  View all courses
                  <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Course grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  {...course}
                  isEnrolled={isEnrolled(course.id)}
                  href={`/courses`}
                  actionLabel={isEnrolled(course.id) ? "Continue" : "Enroll Now →"}
                  actionIcon={isEnrolled(course.id) ? <FiCheckCircle className="h-3.5 w-3.5" /> : null}
                  onAction={() => handleEnroll(course.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────── */}
        <section className="py-24 bg-gray-900/30 border-y border-white/5">
          <div className="max-w-[2560px] w-[98%] mx-auto px-5 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Why EduTech</p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Everything You Need to <br className="hidden md:block" />Succeed
              </h2>
              <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                We combine the best instructors, flexible schedules, and a supportive community to help you reach your goals faster.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-7 hover:border-indigo-500/30 transition-all group">
                  <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600/20 transition-colors">
                    <f.icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{f.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-[2560px] w-[98%] mx-auto px-5 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Student Stories</p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                What Our Students Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-8 space-y-5 hover:border-indigo-500/20 transition-colors">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <FiStar key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">"{t.text}"</p>
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-indigo-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ───────────────────────────────────────── */}
        <section className="py-24 px-5">
          <div className="max-w-[2560px] w-[98%] mx-auto">
            <div className="relative bg-gray-900 border border-white/5 rounded-2xl p-12 md:p-16 overflow-hidden text-center">
              {/* Subtle glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                  Start Today — It's Free
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Ready to Start Your<br />Learning Journey?
                </h2>
                <p className="text-gray-500 text-base leading-relaxed">
                  Join over 45,000 students already building new skills and growing their careers. Your first lesson is just one click away.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                  <Link href={token ? '/dashboard' : '/signup'}>
                    <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                      {token ? 'Go to Dashboard' : 'Create Free Account'}
                    </button>
                  </Link>
                  <Link href="/courses">
                    <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-10 py-4 rounded-xl font-bold text-sm transition-all">
                      {token ? 'View More Courses' : 'Explore Courses'}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default HomePage;
