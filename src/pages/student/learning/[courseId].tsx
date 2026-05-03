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
import apiClient from '@/config/apiClient';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

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
  passingScore?: number;
  quizQuestions?: QuizQuestion[];
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
  const { token, user } = useAppSelector((state) => state.auth);
  const isWishlisted = currentCourse ? wishlist.includes(currentCourse.id || '') : false;
  const liveClasses = useAppSelector(selectLiveClasses);

  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'resources' | 'discussions'>('overview');

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [isSubmittingContext, setIsSubmittingContext] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const handleQuizSubmit = () => {
    if (!currentLesson?.quizQuestions) return;
    
    let correctCount = 0;
    const totalQuestions = currentLesson.quizQuestions.length;
    
    currentLesson.quizQuestions.forEach((q: any, idx: number) => {
      if (quizAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = (correctCount / totalQuestions) * 100;
    const requiredScore = currentLesson.passingScore || 80;

    if (score >= requiredScore) {
      toast.success(`Quiz Passed! You scored ${Math.round(score)}%`);
      // Also mark quiz as complete
      markLessonComplete(currentLessonId);
    } else {
      toast.error(`Quiz Failed. You scored ${Math.round(score)}%. You need ${requiredScore}% to pass.`);
    }
  };

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
    } else if (currentCourse && (currentCourse as any).sections?.[0]?.lessons?.[0]) {
      setCurrentLessonId((currentCourse as any).sections[0].lessons[0]._id || (currentCourse as any).sections[0].lessons[0].id);
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
          type: l.type || (l.videoUrl ? 'video' : 'text'),
          videoUrl: l.videoUrl,
          content: l.content,
          duration: l.duration ? `${l.duration}:00` : '10:00',
          completed: false, 
          isLocked: false,
          order: l.order || 0,
          isPreview: l.isFree || false,
          passingScore: l.passingScore,
          quizQuestions: l.quizQuestions,
          resources: l.resources
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
    setQuizAnswers({}); // Reset quiz answers when changing lesson
    router.push({ query: { ...router.query, lesson: lessonId } }, undefined, { shallow: true });
  };

  const fetchDiscussions = useCallback(async () => {
    if (!courseId || !token) return;
    try {
      const response: any = await apiClient.get(`/discussions/${courseId}`);
      if (response.success) {
        setDiscussions(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch discussions', err);
    }
  }, [courseId, token]);

  const fetchProgress = useCallback(async () => {
    if (!courseId || !token) return;
    try {
      const response: any = await apiClient.get(`/dashboard/progress/${courseId}`);
      if (response.success) {
        setCompletedLessons(response.data.completedLessons || []);
        setProgress(response.data.progress || 0);
      }
    } catch (err) {
      console.error('Failed to fetch progress', err);
    }
  }, [courseId, token]);

  useEffect(() => {
    if (courseId) {
      fetchProgress();
    }
  }, [courseId, fetchProgress]);

  useEffect(() => {
    if (activeTab === 'discussions') {
      fetchDiscussions();
    }
  }, [activeTab, fetchDiscussions]);

  const markLessonComplete = async (lId: string) => {
    if (!courseId || !lId || isMarkingComplete) return;
    setIsMarkingComplete(true);
    try {
      const response: any = await apiClient.post('/dashboard/progress/lesson', {
        courseId,
        lessonId: lId
      });
      if (response.success) {
        setCompletedLessons(prev => Array.from(new Set([...prev, lId])));
        setProgress(response.data.progress);
        if (response.data.progress === 100) {
          toast.success('Congratulations! You have completed the course!');
        }
      }
    } catch (err) {
      console.error('Error marking lesson complete', err);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!currentCourse || !user) return;
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. White Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // 2. Elegant Double Border
    doc.setDrawColor(79, 70, 229); // Indigo
    doc.setLineWidth(1.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    doc.setDrawColor(245, 158, 11); // Gold
    doc.setLineWidth(0.5);
    doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

    // 3. Logo (Attempt to add logo)
    try {
      doc.addImage('/logo.png', 'PNG', pageWidth / 2 - 20, 15, 40, 25);
    } catch (e) {
      console.warn('Logo could not be loaded for certificate', e);
    }

    // 4. Header Section (Moved up)
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(32); // Slightly smaller
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 50, { align: 'center' });
    
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 50, 54, pageWidth / 2 + 50, 54);

    // 5. "Presented to" Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('This is to certify that', pageWidth / 2, 70, { align: 'center' });

    // 6. Student Name
    doc.setFontSize(34);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.setFont('helvetica', 'bold');
    const fullName = `${user.firstName} ${user.lastName}`.toUpperCase();
    doc.text(fullName, pageWidth / 2, 90, { align: 'center' });

    // 7. Course Details Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('has successfully mastered all requirements for the professional course', pageWidth / 2, 105, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(currentCourse.title.toUpperCase(), pageWidth / 2, 120, { align: 'center' });

    // 8. Detailed Stats
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const cId = (currentCourse as any)._id || currentCourse.id || 'N/A';
    doc.text(`Course ID: ${cId}  |  Student ID: ${user.id || 'N/A'}  |  Completion Date: ${dateStr}`, pageWidth / 2, 130, { align: 'center' });

    // 9. Detailed Achievement Text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    doc.text('Performance Summary:', pageWidth / 2, 142, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('GRADE: A+ (95% Overall Achievement Score)', pageWidth / 2, 148, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(156, 163, 175);
    doc.text('This candidate has demonstrated exceptional mastery over the course curriculum, completing all theoretical modules and practical laboratory requirements.', pageWidth / 2, 155, { align: 'center' });

    // 10. Signatures (Moved up from boundary)
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Date Signature Area
    doc.line(40, 175, 90, 175);
    doc.text('DATE', 65, 180, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, 65, 173, { align: 'center' });

    // Director Signature Area
    doc.line(pageWidth - 90, 175, pageWidth - 40, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ATIF SHAHZAD', pageWidth - 65, 180, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('ACADEMY DIRECTOR', pageWidth - 65, 184, { align: 'center' });
    
    // Stylish signature (Simplified Signature)
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text('EduTech', pageWidth - 65, 168, { align: 'center' });

    // 11. Official Rubber Stamp (Image based)
    try {
      doc.addImage('/verified-stamp.png', 'PNG', pageWidth / 2 - 15, 160, 30, 30);
    } catch (e) {
      console.warn('Stamp image could not be loaded', e);
      // Fallback if image fails
      doc.setDrawColor(185, 28, 28);
      doc.circle(pageWidth / 2, 175, 12, 'D');
      doc.text('VERIFIED', pageWidth / 2, 175, { align: 'center' });
    }

    // 12. Subtle Watermark (Even smaller)
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text('Project created by Atif Shahzad | EduTech Portfolio 2024', pageWidth - 6, pageHeight / 2, { angle: 90, align: 'center' });

    doc.save(`${fullName.replace(' ', '_')}_Certificate.pdf`);
    toast.success('Certificate downloaded successfully!');
  };

  const handlePostDiscussion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim() || !token) return;
    setIsSubmittingContext(true);
    try {
      await apiClient.post('/discussions', {
        courseId,
        title: newQuestionTitle,
        content: newQuestionContent
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
              {progress === 100 && (
                <Button 
                  onClick={handleDownloadCertificate}
                  variant="primary" 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest"
                >
                  <FiDownload className="h-3 w-3 mr-2" />
                  Certificate
                </Button>
              )}
           </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
           
           {/* Primary Stage: Video & Description */}
           <div className="flex-1 flex flex-col min-w-0">
              <div className="relative h-[65vh] bg-black shadow-2xl z-10 border-b border-white/5 overflow-y-auto custom-scrollbar">
                 {(currentLesson?.type === 'video' || currentLesson?.type === 'live') ? (
                    <VideoPlayer
                     key={currentLessonId}
                     src={(currentLesson as any)?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                     courseId={courseId as string}
                     lessonId={currentLessonId}
                     autoResume={true}
                     onComplete={() => markLessonComplete(currentLessonId)}
                   />
                 ) : currentLesson?.type === 'text' ? (
                   <div className="p-12 max-w-4xl mx-auto min-h-full">
                     <div className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl text-gray-300 whitespace-pre-wrap leading-relaxed text-lg font-medium shadow-xl">
                        {currentLesson?.content || "No text content available for this lesson."}
                     </div>
                   </div>
                 ) : currentLesson?.type === 'quiz' ? (
                    <div className="p-12 max-w-4xl mx-auto min-h-full">
                       <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl mb-8 text-center shadow-xl shadow-indigo-500/5">
                          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Knowledge Check</h2>
                          <p className="text-indigo-400 font-bold tracking-widest text-sm uppercase">Passing Score Required: {currentLesson.passingScore || 80}%</p>
                       </div>
                       
                       <div className="space-y-8">
                         {(!currentLesson.quizQuestions || currentLesson.quizQuestions.length === 0) ? (
                           <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                              <p className="text-gray-500 font-bold">No questions available for this quiz.</p>
                           </div>
                         ) : (
                           currentLesson.quizQuestions.map((q: any, i: number) => (
                             <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl">
                               <h3 className="text-xl font-bold text-white mb-6"><span className="text-indigo-500 mr-2">{i + 1}.</span> {q.questionText}</h3>
                               <div className="space-y-3">
                                 {q.options?.map((opt: string, j: number) => (
                                   <label key={j} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${quizAnswers[i] === j ? 'border-indigo-500/50 bg-indigo-500/5 text-white' : 'border-white/10 hover:bg-white/5 hover:border-indigo-500/30'}`}>
                                     <input 
                                       type="radio" 
                                       name={`question-${i}`} 
                                       checked={quizAnswers[i] === j}
                                       onChange={() => setQuizAnswers(prev => ({ ...prev, [i]: j }))}
                                       className="w-5 h-5 text-indigo-500 bg-black/50 border-white/20 focus:ring-indigo-500 focus:ring-offset-gray-900 cursor-pointer" 
                                     />
                                     <span className={`font-medium transition-colors ${quizAnswers[i] === j ? 'text-indigo-300' : 'text-gray-300 group-hover:text-white'}`}>{opt}</span>
                                   </label>
                                 ))}
                               </div>
                             </div>
                           ))
                         )}
                       </div>

                       {currentLesson.quizQuestions && currentLesson.quizQuestions.length > 0 && (
                         <div className="mt-12 flex justify-center">
                           <Button 
                             variant="primary" 
                             size="lg" 
                             disabled={Object.keys(quizAnswers).length < currentLesson.quizQuestions.length}
                             className="bg-indigo-600 hover:bg-indigo-500 px-12 py-5 text-sm tracking-widest uppercase font-black rounded-2xl shadow-2xl shadow-indigo-600/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed" 
                             onClick={handleQuizSubmit}
                           >
                             {Object.keys(quizAnswers).length < currentLesson.quizQuestions.length ? 'Answer all questions' : 'Submit Quiz'}
                           </Button>
                         </div>
                       )}
                    </div>
                  ) : null}
                 
                 {/* Playback HUD Overlay */}
                 <div className="absolute top-6 left-6 flex items-center gap-3 z-20 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-2xl">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{currentLesson?.type === 'quiz' ? 'Current Quiz' : currentLesson?.type === 'text' ? 'Current Reading' : 'Current Lesson'}</p>
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
                 {modules.map((m: any, mIdx: number) => (
                    <div key={m.id} className="space-y-3">
                       <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em] px-4">Module {mIdx + 1}: {m.title}</p>
                       <div className="space-y-2">
                          {m.lessons.map((l: any) => (
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
                                     {l.isLocked ? <FiLock className="h-5 w-5" /> : l.type === 'video' ? <FiPlay className="h-5 w-5" /> : l.type === 'live' ? <FiRadio className="h-5 w-5" /> : <FiFileText className="h-5 w-5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className={`text-sm font-bold truncate tracking-tight ${currentLessonId === l.id ? 'text-white' : 'text-gray-400'}`}>{l.title}</p>
                                     <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{l.duration}</span>
                                        {(l.completed || completedLessons.includes(l.id)) && (
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
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2 relative z-10">Next Lesson Up</h4>
                      <p className="text-xs text-indigo-400 font-bold mb-4 line-clamp-1 relative z-10">{nextLesson.title}</p>
                      <Button onClick={() => handleLessonSelect(nextLesson.id)} variant="primary" fullWidth size="sm" className="bg-indigo-600 hover:bg-indigo-500">Jump to Next</Button>
                   </div>
                 ) : (
                    <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden text-center">
                      <div className="mx-auto w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                        <FiCheck className="text-emerald-400 h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Course Completed</h4>
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-4">You have reached the end!</p>
                      <Button 
                        onClick={handleDownloadCertificate}
                        variant="primary" 
                        fullWidth 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-[10px] font-black uppercase"
                      >
                        <FiDownload className="mr-2 h-3 w-3" />
                        Download Certificate
                      </Button>
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
