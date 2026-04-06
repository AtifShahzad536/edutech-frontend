import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FiPlay, FiClock, FiUsers, FiStar, FiBookOpen, FiCheck, FiLock, FiDownload, FiHeart, FiShare2, FiShoppingCart, FiBarChart2, FiGlobe, FiCheckCircle, FiVideo } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchCourseById, addToCart, toggleWishlist, enrollCourse } from '@/store/slices/courseSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { selectLiveClasses, selectEnrolledCourses } from '@/store/index';
import { Course, Lesson, Module, AuthenticatedPage } from '@/types';

const CourseDetailsPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentCourse, isLoading, cart, wishlist } = useAppSelector((state) => state.courses);
  const enrolledCourses = useAppSelector(selectEnrolledCourses);
  const liveClasses = useAppSelector(selectLiveClasses);
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  
  const enrolled = useMemo(() => {
    if (!currentCourse || !enrolledCourses) return false;
    return enrolledCourses.some((c: any) => {
      const id = typeof c === 'string' ? c : (c?._id || c?.id);
      return String(id) === String(currentCourse.id) || String(id) === String(currentCourse._id);
    });
  }, [currentCourse, enrolledCourses]);
  const activeLiveSession = currentCourse ? liveClasses.find(lc => lc.courseId === currentCourse.id && lc.status === 'online') : null;

  const isWishlisted = currentCourse ? wishlist.includes(currentCourse.id) : false;
  const isInCart = currentCourse ? cart.includes(currentCourse.id) : false;

  useEffect(() => {
    if (router.query.id) {
      dispatch(fetchCourseById(router.query.id as string));
    }
  }, [dispatch, router.query.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Loading Course...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
            <FiLock className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight mb-2">Course Not Found</h3>
            <p className="text-gray-500 text-sm max-w-sm">The course you are looking for might have been moved or doesn't exist.</p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/student/courses')}>
            Browse All Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleEnroll = () => {
    if (!currentCourse) return;
    
    // If course is free (price is 0), enroll directly and skip checkout
    // Robust check for numeric 0 or "0"
    if (Number(currentCourse.price) === 0) {
      dispatch(enrollCourse(currentCourse));
      dispatch(addNotification({
        id: Date.now().toString(),
        userId: user?.id || 'guest',
        type: 'system',
        title: 'Access Granted',
        message: `You have successfully enrolled in ${currentCourse.title}. Start learning now!`,
        isRead: false,
        createdAt: new Date().toISOString()
      }));
      router.push(`/student/learning/${currentCourse.id}`);
    } else {
      router.push(`/checkout/${currentCourse.id}`);
    }
  };

  const handleAddToCart = () => {
    if (!currentCourse) return;
    dispatch(addToCart(currentCourse.id));
    dispatch(addNotification({
      id: Date.now().toString(),
      userId: user?.id || 'guest',
      type: 'system',
      title: 'Added to Cart',
      message: `${currentCourse.title} has been added to your cart.`,
      isRead: false,
      createdAt: new Date().toISOString()
    }));
  };

  const handleToggleWishlist = () => {
    if (!currentCourse) return;
    dispatch(toggleWishlist(currentCourse.id));
    dispatch(addNotification({
      id: Date.now().toString(),
      userId: user?.id || 'guest',
      type: 'system',
      title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      message: isWishlisted 
        ? `${currentCourse.title} removed from your wishlist.` 
        : `${currentCourse.title} added to your wishlist.`,
      isRead: false,
      createdAt: new Date().toISOString()
    }));
  };

  const handleShare = () => {
    if (typeof window === 'undefined' || !currentCourse) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      dispatch(addNotification({
        id: Date.now().toString(),
        userId: user?.id || 'guest',
        type: 'system',
        title: 'Link Copied',
        message: 'Course link has been copied to your clipboard.',
        isRead: false,
        createdAt: new Date().toISOString()
      }));
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <FiStar
            key={i}
            className={clsx(
              'h-3.5 w-3.5 transition-colors',
              i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/10'
            )}
          />
        ))}
      </div>
    );
  };

  const mockModules: Module[] = [
    {
      id: '1',
      courseId: currentCourse.id,
      title: 'Module 1: Foundations',
      description: 'Mastering the core fundamentals of the technology.',
      order: 1,
      lessons: [
        { id: '1-1', courseId: currentCourse.id, title: 'Course Introduction', description: 'What we will build together.', type: 'video', content: '', duration: 12, order: 1, isPreview: true, createdAt: '', updatedAt: '' },
        { id: '1-2', courseId: currentCourse.id, title: 'Core Concepts & Setup', description: 'Getting your environment ready.', type: 'video', content: '', duration: 25, order: 2, isPreview: false, createdAt: '', updatedAt: '' },
      ],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '2',
      courseId: currentCourse.id,
      title: 'Module 2: Advanced Techniques',
      description: 'Diving deep into complex patterns and architectures.',
      order: 2,
      lessons: [
        { id: '2-1', courseId: currentCourse.id, title: 'State Management Strategy', description: 'Handling data at scale.', type: 'video', content: '', duration: 40, order: 1, isPreview: false, createdAt: '', updatedAt: '' },
        { id: '2-2', courseId: currentCourse.id, title: 'Optimizing Performance', description: 'Techniques for a faster experience.', type: 'video', content: '', duration: 35, order: 2, isPreview: false, createdAt: '', updatedAt: '' },
      ],
      createdAt: '',
      updatedAt: '',
    },
  ];

  const mockReviews = [
    {
      id: '1',
      courseId: currentCourse.id,
      studentId: '1',
      student: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'student', createdAt: '', updatedAt: '' },
      rating: 5,
      comment: 'This course totally changed how I think about development. The instructor is incredibly clear and practical.',
      createdAt: '2 months ago',
      updatedAt: '2024-01-10',
    },
    {
      id: '2',
      courseId: currentCourse.id,
      studentId: '2',
      student: { id: '2', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@example.com', role: 'student', createdAt: '', updatedAt: '' },
      rating: 4.5,
      comment: 'Brilliant content and very high production quality. Highly recommended for anyone serious about growth.',
      createdAt: '1 month ago',
      updatedAt: '2024-01-08',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Course Header Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Dark Premium Hero */}
            <div className="relative overflow-hidden bg-gray-900 border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] -ml-24 -mb-24" />
              
              {activeLiveSession && (
                <div className="absolute top-8 right-8 z-20 animate-bounce">
                  <div className="flex items-center gap-3 bg-red-600 px-6 py-2 rounded-xl text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/30">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
                  </div>
                </div>
              )}

              <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {currentCourse.category}
                  </div>
                  <div className="bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {currentCourse.level}
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {currentCourse.title}
                </h1>
                
                <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                  {currentCourse.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/5 mt-6">
                  <div className="flex items-center gap-3">
                    {renderStars(currentCourse.rating)}
                    <span className="text-sm font-bold text-white/50">{currentCourse.rating} ({currentCourse.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <FiUsers className="h-4 w-4 text-indigo-400" />
                    <span>{currentCourse.studentsCount} Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <FiClock className="h-4 w-4 text-indigo-400" />
                    <span>{currentCourse.duration} mins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-gray-900/50 border border-white/5 rounded-3xl p-6">
              <nav className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl mb-8 w-fit">
                {['overview', 'curriculum', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={clsx(
                      'px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200',
                      activeTab === tab
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <div className="animate-fade-in space-y-10">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight mb-4 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        About this course
                      </h2>
                      <p className="text-gray-400 leading-relaxed text-sm">
                        {currentCourse.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        What you'll learn
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          'Build modern web applications with React & Redux',
                          'Master hooks, state management, and props',
                          'Responsive UI design with modern CSS patterns',
                          'Deploying applications to production environments',
                          'Handling user authentication and protected routes',
                          'Real-time data fetching and API optimization',
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors group">
                            <div className="w-6 h-6 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <FiCheck className="h-3.5 w-3.5 text-indigo-400" />
                            </div>
                            <span className="text-gray-400 text-sm leading-tight leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <h2 className="text-xl font-black text-white tracking-tight">Course Curriculum</h2>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                        {mockModules.length} Modules • {mockModules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                      </div>
                    </div>

                    <div className="space-y-4">
                      {mockModules.map((module) => (
                        <div key={module.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group">
                          <div className="bg-white/[0.03] px-6 py-4 flex items-center justify-between border-b border-white/5">
                            <div>
                              <h3 className="text-sm font-black text-white tracking-tight">{module.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                            </div>
                          </div>
                          <div className="divide-y divide-white/5">
                            {module.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.04] transition-all group/lesson">
                                <div className="flex items-center gap-4">
                                  <div className="w-9 h-9 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/lesson:scale-110 transition-transform">
                                    <FiPlay className="h-4 w-4 text-indigo-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-300 group-hover/lesson:text-white transition-colors">{lesson.title}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                      <span>{lesson.duration} mins</span>
                                      {lesson.isPreview && <span className="text-indigo-400">Preview</span>}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  {lesson.isPreview || enrolled ? (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 !p-0 hover:bg-indigo-600 hover:text-white transition-all"
                                      onClick={() => router.push(`/student/learning/${currentCourse.id}?lesson=${lesson.id}`)}
                                    >
                                      <FiPlay className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : (
                                    <div className="p-2 bg-white/5 rounded-lg">
                                      <FiLock className="h-3.5 w-3.5 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recorded Live Sessions */}
                    {liveClasses.some(lc => lc.courseId === currentCourse.id && lc.status === 'ended') && (
                      <div className="mt-12 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                          <h2 className="text-xl font-black text-white tracking-tight">Recorded Live Sessions</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {liveClasses
                            .filter(lc => lc.courseId === currentCourse.id && lc.status === 'ended')
                            .map((session) => (
                              <div key={session.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all group border-l-4 border-l-red-500/50">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-red-500/20">
                                    Recording
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{session.duration} Recorded</span>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-2">{session.title}</h3>
                                <p className="text-xs text-gray-500 mb-6">{session.module}</p>
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  fullWidth 
                                  className="py-3 rounded-xl text-[10px] font-black uppercase"
                                  onClick={() => router.push(`/student/learning/${currentCourse.id}?session=${session.id}`)}
                                >
                                  <FiPlay className="mr-2 h-3 w-3" />
                                  Watch Recording
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="animate-fade-in space-y-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                      <h2 className="text-xl font-black text-white tracking-tight">Student Feedback</h2>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-white">{currentCourse.rating}</span>
                          {renderStars(currentCourse.rating)}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{currentCourse.reviewsCount} Ratings</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-white/10 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs">
                                {review.student.firstName[0]}{review.student.lastName[0]}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-white">{review.student.firstName} {review.student.lastName}</h4>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{review.createdAt}</p>
                              </div>
                            </div>
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed italic">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area: Pricing & Enrollment */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl -mr-16 -mt-16" />
              
              <div className="relative z-10 space-y-2">
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Full Course Lifetime Access</p>
                <div className="flex items-end gap-4">
                  <span className="text-5xl font-black text-white tracking-tighter">${currentCourse.price}</span>
                  <span className="text-lg text-gray-600 line-through font-bold mb-1">${(currentCourse.price * 1.5).toFixed(2)}</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full w-fit">
                  Save {(1.5 * 100 - 100).toFixed(0)}% for a limited time
                </p>
              </div>

              <div className="relative z-10 space-y-3">
                {enrolled ? (
                  activeLiveSession ? (
                    <Button 
                      variant="primary" 
                      fullWidth 
                      size="lg" 
                      className="bg-red-600 hover:bg-red-500 shadow-red-600/20"
                      onClick={() => router.push(`/live-class?roomID=${activeLiveSession.id}`)}
                    >
                      <FiVideo className="h-4 w-4 mr-2" />
                      Join Live Session
                    </Button>
                  ) : (
                    <Button variant="primary" fullWidth size="lg" onClick={() => router.push(`/student/learning/${currentCourse.id}`)}>
                      <FiPlay className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  )
                ) : (
                  <div className="space-y-3">
                    <Button onClick={handleEnroll} fullWidth size="lg">
                      <FiShoppingCart className="h-4 w-4 mr-2" />
                      Enroll Now
                    </Button>
                    <Button 
                      variant="secondary" 
                      fullWidth 
                      onClick={handleAddToCart}
                      disabled={isInCart}
                    >
                      {isInCart ? 'In Cart' : 'Add to Cart'}
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className={clsx('flex-1 !px-0', isWishlisted && 'text-red-500 border-red-500/50')}
                    onClick={handleToggleWishlist}
                  >
                    <FiHeart className={clsx('h-4 w-4 mr-2', isWishlisted && 'fill-current')} />
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </Button>
                  <Button variant="outline" className="flex-1 !px-0" onClick={handleShare}>
                    <FiShare2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="relative z-10 pt-8 border-t border-white/5 space-y-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">This course includes</h4>
                <ul className="space-y-4">
                  {[
                    { icon: FiPlay, text: 'Full HD Video Lectures' },
                    { icon: FiDownload, text: 'Downloadable Resources' },
                    { icon: FiBarChart2, text: 'Practice Assignments' },
                    { icon: FiGlobe, text: 'Community Discussions' },
                    { icon: FiCheckCircle, text: 'Personal Certification' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-sm text-gray-400 group">
                      <div className="w-8 h-8 bg-white/[0.03] border border-white/5 rounded-lg flex items-center justify-center group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20 transition-all">
                        <item.icon className="h-3.5 w-3.5 text-gray-500 group-hover:text-indigo-400" />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 text-center pt-2">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">30-Day Money-Back Guarantee</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

// Helper function for className
function clsx(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

CourseDetailsPage.allowedRoles = ['student', 'instructor', 'admin'];
export default CourseDetailsPage;
