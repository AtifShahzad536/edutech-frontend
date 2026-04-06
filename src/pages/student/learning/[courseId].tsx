import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  FiMessageSquare, FiBook, FiDownload, FiPlay, FiCheck, FiLock, 
  FiChevronLeft, FiChevronRight, FiMaximize, FiSettings, FiActivity,
  FiFileText, FiStar, FiShare2, FiHeart, FiClock, FiVideo, FiRadio
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchCourseById, toggleWishlist } from '@/store/slices/courseSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { selectLiveClasses } from '@/store/index';
import { Lesson, AuthenticatedPage } from '@/types';
import axios from 'axios';

interface ExtendedLesson extends Omit<Lesson, 'courseId' | 'description' | 'type' | 'content' | 'duration' | 'createdAt' | 'updatedAt' | 'order' | 'isPreview'> {
  courseId?: string;
  description?: string;
  type: 'video' | 'live' | 'text' | 'quiz';
  content?: string;
  duration: string;
  createdAt?: string;
  updatedAt?: string;
  completed?: boolean;
  isLocked?: boolean;
  order: number;
  isPreview: boolean;
}

interface ExtendedModule {
  id: string;
  title: string;
  lessons: ExtendedLesson[];
}

const CourseLearningPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tabsRef = useRef<HTMLDivElement>(null);
  const { courseId, lesson: lessonQueryId } = router.query;
  
  const { currentCourse, wishlist } = useAppSelector((state) => state.courses);
  const { token } = useAppSelector((state) => state.auth);
  const isWishlisted = currentCourse ? wishlist.includes(currentCourse.id || '') : false;
  const liveClasses = useAppSelector(selectLiveClasses);

  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'resources' | 'discussions'>('overview');

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [isSubmittingContext, setIsSubmittingContext] = useState(false);

  const scrollToTabs = (tab: 'resources' | 'discussions') => {
    setActiveTab(tab);
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId as string));
    }
  }, [dispatch, courseId]);

  useEffect(() => {
    if (lessonQueryId) {
      setCurrentLessonId(lessonQueryId as string);
    } else if (currentCourse?.lessons?.length) {
      setCurrentLessonId(currentCourse.lessons[0].id);
    } else {
        setCurrentLessonId('lesson-1');
    }
  }, [lessonQueryId, currentCourse]);

  const modules: ExtendedModule[] = useMemo(() => {
    const courseAny = currentCourse as any;
    if (courseAny?.sections && courseAny.sections.length > 0) {
      // Map MongoDB Sections to Modules
      return courseAny.sections.map((s: any) => ({
        id: s._id || s.id,
        title: s.title,
        lessons: s.lessons.map((l: any) => ({
          id: l._id || l.id,
          title: l.title,
          type: l.videoUrl ? 'video' : 'text',
          videoUrl: l.videoUrl,
          duration: l.duration ? `${l.duration}:00` : '10:00',
          completed: false, // Update with real progress tracker later
          isLocked: false,
          order: l.order || 0,
          isPreview: l.isFree || false
        }))
      }));
    }
    
    // Fallback mapping for older schema
    if (currentCourse?.lessons?.length) {
        return [
            {
                id: 'm1',
                title: 'Course Curriculum',
                lessons: currentCourse.lessons.map(l => ({
                   id: l.id,
                   title: l.title,
                   type: 'video',
                   duration: `${l.duration || 10}:00`,
                   completed: false,
                   isLocked: false,
                   order: l.order || 0,
                   isPreview: l.isPreview || false
                }))
            }
        ];
    }
    
    return [
      {
        id: 'empty',
        title: 'Curriculum Coming Soon',
        lessons: []
      }
    ];
  }, [currentCourse]);

  const allLessons = useMemo(() => modules.flatMap(m => m.lessons), [modules]);
  const currentLesson = useMemo(() => 
    allLessons.find(l => l.id === currentLessonId) || allLessons[0], 
    [allLessons, currentLessonId]
  );

  const activeLiveSession = currentCourse ? liveClasses.find(lc => lc.courseId === currentCourse.id && lc.status === 'online') : null;

  const currentLessonIndex = useMemo(() => allLessons.findIndex(l => l.id === currentLessonId), [allLessons, currentLessonId]);
  const nextLesson = useMemo(() => currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null, [allLessons, currentLessonIndex]);

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    router.push({ query: { ...router.query, lesson: lessonId } }, undefined, { shallow: true });
  };

  const fetchDiscussions = useCallback(async () => {
    if (!courseId || !token) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/discussions/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDiscussions(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch discussions', err);
    }
  }, [courseId, token]);

  useEffect(() => {
    if (activeTab === 'discussions') {
      fetchDiscussions();
    }
  }, [activeTab, fetchDiscussions]);

  const handlePostDiscussion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim() || !token) return;
    setIsSubmittingContext(true);
    try {
      await axios.post('http://localhost:5000/api/discussions', {
        courseId,
        title: newQuestionTitle,
        content: newQuestionContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewQuestionTitle('');
      setNewQuestionContent('');
      dispatch(addNotification({
        id: Date.now().toString(),
        userId: 'student',
        type: 'system',
        title: 'Question Posted',
        message: 'Your question has been mapped to the discussion board.',
        isRead: false,
        createdAt: new Date().toISOString()
      }));
      fetchDiscussions();
    } catch (err) {
      console.error(err);
      dispatch(addNotification({
        id: Date.now().toString(),
        userId: 'student',
        type: 'system',
        title: 'Error Intercepted',
        message: 'Failed to post your question. Please try again.',
        isRead: false,
        createdAt: new Date().toISOString()
      }));
    } finally {
      setIsSubmittingContext(false);
    }
  };

  const handleToggleWishlist = () => {
    if (currentCourse) {
      dispatch(toggleWishlist(currentCourse.id));
      dispatch(addNotification({
        id: Date.now().toString(),
        userId: 'student',
        type: 'system',
        title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
        message: `${currentCourse.title} has been updated.`,
        isRead: false,
        createdAt: new Date().toISOString()
      }));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      dispatch(addNotification({
        id: Date.now().toString(),
        userId: 'student',
        type: 'system',
        title: 'Link Copied',
        message: 'Lesson link copied to clipboard.',
        isRead: false,
        createdAt: new Date().toISOString()
      }));
    });
  };

  const showPlaceholderAction = (action: string) => {
    dispatch(addNotification({
      id: Date.now().toString(),
      userId: 'student',
      type: 'system',
      title: `${action} Coming Soon`,
      message: `The ${action} section is currently under construction.`,
      isRead: false,
      createdAt: new Date().toISOString()
    }));
  };

  return (
    <DashboardLayout hideHeader hidePadding>
      <div className="flex flex-col min-h-screen bg-black text-white">
        
        {/* Top Navigation HUD */}
        <header className="h-20 bg-gray-950/80 backdrop-blur-2xl border-b border-white/5 px-8 flex items-center justify-between z-50">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all group"
              >
                 <FiChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </button>
              <div className="h-8 w-px bg-white/5" />
              <div>
                 <h1 className="text-sm font-black uppercase tracking-widest text-white/50 leading-none mb-1">Learning Portal</h1>
                 <p className="text-lg font-bold text-white tracking-tight leading-none">{currentCourse?.title || 'Course Player'}</p>
              </div>
           </div>

           <div className="flex items-center gap-4">
              {activeLiveSession && (
                <div className="flex items-center gap-3 bg-red-600/10 border border-red-500/20 px-4 py-2 rounded-xl animate-pulse cursor-pointer hover:bg-red-600 transition-all group" onClick={() => router.push(`/live-class?roomID=${activeLiveSession.id}`)}>
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:bg-white" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Live Session Active</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                 <button 
                   onClick={() => scrollToTabs('resources')} 
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'}`}
                 >
                   Resources
                 </button>
                 <button 
                   onClick={() => scrollToTabs('discussions')} 
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'discussions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'}`}
                 >
                   Discussion
                 </button>
              </div>
           </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
           
           {/* Primary Stage: Video & Description */}
           <div className="flex-1 flex flex-col min-w-0">
              <div className="relative h-[65vh] bg-black shadow-2xl z-10 border-b border-white/5">
                 <VideoPlayer
                   key={currentLessonId}
                   src={(currentLesson as any)?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                   courseId={courseId as string}
                   lessonId={currentLessonId}
                   autoResume={true}
                 />
                 
                 {/* Video Playback HUD Overlay */}
                 <div className="absolute top-6 left-6 flex items-center gap-3 z-20 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Lesson</p>
                       <p className="text-sm font-bold text-white tracking-tight">{currentLesson?.title}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-gray-950 p-10">
                 <div className="max-w-4xl mx-auto space-y-12 pb-20">
                    
                    {/* Lesson Meta */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-10">
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <span className="bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/20">Module 01</span>
                             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{currentLesson?.duration} • Professional Quality</span>
                          </div>
                          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{currentLesson?.title}</h2>
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={handleToggleWishlist} className={`w-12 h-12 rounded-2xl ${isWishlisted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-indigo-600'} border flex items-center justify-center transition-all active:scale-95`}>
                             <FiHeart className={isWishlisted ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
                          </button>
                          <button onClick={handleShare} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-all active:scale-95">
                             <FiShare2 className="h-5 w-5" />
                          </button>
                       </div>
                    </div>

                    {/* Tabs HUD */}
                    <div className="space-y-8" ref={tabsRef}>
                       <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl w-fit">
                          {['overview', 'resources', 'curriculum', 'discussions'].map((t) => (
                            <button 
                              key={t}
                              onClick={() => setActiveTab(t as any)}
                              className={`px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === t ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-gray-500 hover:text-white'
                              }`}
                            >
                               {t}
                            </button>
                          ))}
                       </div>

                       <div className="text-gray-400 leading-relaxed text-lg">
                          {activeTab === 'overview' && (
                             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <p className="mb-6">{currentCourse?.description || 'In this lesson, we will cover what you can expect from this course module and dive deep into core architectural concepts.'}</p>
                                <div className="grid grid-cols-2 gap-6 mt-10">
                                   <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-2 group hover:bg-white/[0.04]">
                                      <FiClock className="text-indigo-500 h-6 w-6 group-hover:scale-110 transition-transform" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Lecture Time</p>
                                      <p className="text-xl font-bold text-white">{currentLesson?.duration || '10:00'}</p>
                                   </div>
                                   <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-2 group hover:bg-white/[0.04]">
                                      <FiActivity className="text-emerald-500 h-6 w-6 group-hover:scale-110 transition-transform" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Knowledge Level</p>
                                      <p className="text-xl font-bold text-white capitalize">{currentCourse?.level || 'All Levels'}</p>
                                   </div>
                                </div>
                             </div>
                           )}
                           
                           {activeTab === 'resources' && (
                             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                               {currentLesson && (currentLesson as any).resources && (currentLesson as any).resources.length > 0 ? (
                                 <div className="space-y-4">
                                   <div className="flex items-center gap-3 mb-6">
                                     <FiDownload className="text-emerald-500 h-5 w-5" />
                                     <h3 className="text-white font-bold text-lg tracking-tight">Lesson Resources</h3>
                                   </div>
                                   {(currentLesson as any).resources.map((res: any, idx: number) => (
                                      <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-colors group">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                               <FiFileText className="text-emerald-400 h-4 w-4" />
                                            </div>
                                            <div>
                                               <p className="text-white font-bold text-sm tracking-tight">{res.title}</p>
                                               <p className="text-[10px] text-gray-500 uppercase tracking-widest">{res.fileType || 'Document'}</p>
                                            </div>
                                         </div>
                                         <FiDownload className="text-gray-500 group-hover:text-white transition-colors h-5 w-5" />
                                      </a>
                                   ))}
                                 </div>
                               ) : (
                                 <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                                   <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
                                     <FiDownload className="h-8 w-8 text-indigo-400" />
                                   </div>
                                   <div>
                                     <h3 className="text-white font-bold text-xl tracking-tight">No Attached Resources</h3>
                                     <p className="text-gray-500 text-sm max-w-sm mt-2">There are no additional resources mapped to this specific lesson. Please check individual lectures for downloadable PDFs, ZIPs, or slides.</p>
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}

                           {activeTab === 'curriculum' && (
                             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                               <p className="mb-6">Explore the full layout of everything you will master in this massive professional grade bootcamp.</p>
                               <div className="space-y-4">
                                 {modules.map((m, mIdx) => (
                                    <div key={m.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">Module {mIdx + 1}</p>
                                      <h4 className="text-white font-bold tracking-tight">{m.title}</h4>
                                      <p className="text-xs text-gray-500 mt-1">{m.lessons.length} logical steps to completion.</p>
                                    </div>
                                 ))}
                               </div>
                             </div>
                           )}

                           {activeTab === 'discussions' && (
                             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                                  <h3 className="text-white font-bold text-lg mb-4">Ask a new question</h3>
                                  <div className="space-y-3">
                                    <input 
                                       type="text" 
                                       placeholder="Title your question..." 
                                       value={newQuestionTitle}
                                       onChange={(e) => setNewQuestionTitle(e.target.value)}
                                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    <textarea 
                                       placeholder="Provide more context..." 
                                       value={newQuestionContent}
                                       onChange={(e) => setNewQuestionContent(e.target.value)}
                                       rows={3}
                                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
                                    />
                                    <div className="flex justify-end">
                                      <Button onClick={handlePostDiscussion} disabled={isSubmittingContext} variant="primary" className="bg-indigo-600 hover:bg-indigo-500">
                                        {isSubmittingContext ? 'Posting...' : 'Post Question'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                   {discussions.length > 0 ? discussions.map((disc: any) => (
                                      <div key={disc._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex gap-4 transition-colors hover:bg-white/[0.03]">
                                         <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-indigo-500/30">
                                            {disc.user?.avatar ? <img src={disc.user.avatar} className="w-full h-full object-cover" /> : <FiMessageSquare className="text-indigo-400 h-4 w-4" />}
                                         </div>
                                         <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                               <h4 className="text-white font-bold text-sm">{disc.title}</h4>
                                               <span className="text-[10px] text-gray-500">{new Date(disc.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-indigo-400 font-bold mb-2">{disc.user?.firstName} {disc.user?.lastName}</p>
                                            <p className="text-sm text-gray-400 leading-relaxed">{disc.content}</p>
                                         </div>
                                      </div>
                                   )) : (
                                     <div className="text-center py-10">
                                       <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                         <FiMessageSquare className="h-8 w-8 text-blue-400" />
                                       </div>
                                       <h3 className="text-white font-bold text-xl tracking-tight">No Discussions Yet</h3>
                                       <p className="text-gray-500 text-sm max-w-sm mx-auto mt-2">Become the first to start a conversation in this course!</p>
                                     </div>
                                   )}
                                </div>
                             </div>
                           )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Content Sidebar */}
           <aside className="w-[450px] bg-gray-950 border-l border-white/5 flex flex-col h-screen sticky top-0 shadow-2xl z-40">
              <div className="p-8 border-b border-white/5 bg-black/40">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 flex items-center gap-3">
                    <FiFileText className="text-indigo-500" />
                    Course Content
                 </h3>
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{allLessons.length} Lessons // {modules.length} Modules</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                 {modules.map((m, mIdx) => (
                    <div key={m.id} className="space-y-3">
                       <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] px-4">Module {mIdx + 1}: {m.title}</p>
                       <div className="space-y-2">
                          {m.lessons.map((l) => (
                            <button 
                              key={l.id}
                              onClick={() => !l.isLocked && handleLessonSelect(l.id)}
                              className={`w-full group text-left p-5 rounded-2xl border transition-all relative overflow-hidden ${
                                currentLessonId === l.id 
                                  ? 'bg-indigo-600/20 border-indigo-500/50 shadow-2xl' 
                                  : l.isLocked 
                                  ? 'bg-gray-950 border-white/5 opacity-40 grayscale cursor-not-allowed' 
                                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                              }`}
                            >
                               {currentLessonId === l.id && <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-500" />}
                               <div className="flex items-center gap-5">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                                    currentLessonId === l.id 
                                      ? 'bg-indigo-600 text-white border-white/20' 
                                      : 'bg-black/40 text-gray-600 border-white/5 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 group-hover:border-indigo-500/30'
                                  }`}>
                                     {l.isLocked ? <FiLock className="h-5 w-5" /> : l.type === 'video' ? <FiPlay className="h-5 w-5 hover:ml-1 transition-all" /> : l.type === 'live' ? <FiRadio className="h-5 w-5" /> : <FiFileText className="h-5 w-5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className={`text-sm font-bold truncate tracking-tight transition-colors ${
                                       currentLessonId === l.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                     }`}>{l.title}</p>
                                     <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{l.duration}</span>
                                        {l.completed && (
                                          <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                             <FiCheck className="h-2 w-2 text-emerald-500" />
                                             <span className="text-[8px] font-black text-emerald-500 uppercase">Done</span>
                                          </div>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>

              {/* Sidebar Footer */}
              <div className="p-8 bg-black/40 border-t border-white/5 mt-auto">
                 {nextLesson ? (
                   <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/20 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/30 transition-colors" />
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2 relative z-10">Next Lesson Up</h4>
                      <p className="text-xs text-indigo-400 font-bold mb-4 line-clamp-1 relative z-10">{nextLesson.title}</p>
                      <Button onClick={() => handleLessonSelect(nextLesson.id)} variant="primary" fullWidth size="sm" className="bg-indigo-600 hover:bg-indigo-500 relative z-10 transition-colors">Jump to Next</Button>
                   </div>
                 ) : (
                   <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden text-center">
                     <div className="mx-auto w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                       <FiCheck className="text-emerald-400 h-5 w-5" />
                     </div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Course Completed</h4>
                     <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">You have reached the end!</p>
                   </div>
                 )}
              </div>
           </aside>
        </main>
      </div>
    </DashboardLayout>
  );
};

CourseLearningPage.allowedRoles = ['student', 'instructor', 'admin'];
export default CourseLearningPage;
