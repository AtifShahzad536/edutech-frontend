import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSave, FiPlus, FiTrash2, FiX, FiUpload, FiEye, FiZap, FiLayers, FiCpu, FiGrid, FiActivity, FiShield, FiFileText, FiClock, FiDollarSign, FiType, FiArrowRight, FiArrowLeft, FiCheckCircle, FiVideo, FiRadio } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { AuthenticatedPage } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { addCourse, updateCourse, fetchCourseById } from '@/store/slices/courseSlice';
import { useEffect } from 'react';
import API_URL from '@/config/api';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  language: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'live';
  content?: string;
  isUploading?: boolean;
}

const CreateCoursePage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = router.query;
  const { currentCourse } = useAppSelector(state => state.courses);

  const [currentStep, setCurrentStep] = useState(1);
  const [modules, setModules] = useState<Module[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<CourseFormData>();

  useEffect(() => {
    if (id) {
       dispatch(fetchCourseById(id as string));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && currentCourse && currentCourse.id === id) {
       reset({
          title: currentCourse.title,
          description: currentCourse.description || '',
          category: currentCourse.category || '',
          level: (currentCourse.level as any) || 'beginner',
          price: currentCourse.price || 0,
          language: 'English',
       });
       
       // Hydrate Curriculum (Modules & Lessons)
        if (currentCourse.sections && currentCourse.sections.length > 0) {
          setModules(currentCourse.sections.map((s: any) => ({
            id: s._id || s.id,
            title: s.title,
            description: s.description || '',
            lessons: s.lessons.map((l: any) => ({
              id: l._id || l.id,
              title: l.title,
              type: l.type || (l.videoUrl ? 'video' : 'text'),
              content: l.videoUrl || l.content || ''
            }))
          })));
        } else if (currentCourse.lessons && (currentCourse.lessons as any).length > 0) {
           // Fallback for older flat-lessons schema
           setModules([{
              id: 'mod-loaded-' + Date.now(),
              title: 'Legacy Curriculum',
              description: '',
              lessons: (currentCourse.lessons as any).map((l: any) => ({
                 id: l._id || l.id,
                 title: l.title,
                 type: l.type || 'video',
                 content: l.videoUrl || l.content || ''
              }))
           }]);
        }
    }
  }, [id, currentCourse, reset]);

  const addModule = () => {
    const newModule: Module = { id: Date.now().toString(), title: '', description: '', lessons: [] };
    setModules([...modules, newModule]);
  };

  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, [field]: value } : m));
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = { id: Date.now().toString() + Math.random().toString(36).substring(7), title: '', type: 'video' };
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof Lesson, value: any) => {
    setModules(modules.map(m => m.id === moduleId ? { 
      ...m, 
      lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l) 
    } : m));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/uploads/assignment-file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        setThumbnailUrl(result.data);
      }
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleLessonUpload = async (moduleId: string, lessonId: string, file: File) => {
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      lessons: m.lessons.map(l => l.id === lessonId ? { ...l, isUploading: true } : l)
    } : m));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/uploads/assignment-file`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        updateLesson(moduleId, lessonId, 'content', result.data);
      }
    } catch (error) {
      console.error('Lesson upload failed:', error);
    } finally {
       setModules(prev => prev.map(m => m.id === moduleId ? {
         ...m,
         lessons: m.lessons.map(l => l.id === lessonId ? { ...l, isUploading: false } : l)
       } : m));
    }
  };

  const onSubmit = async (data: any) => {
      const isEditing = !!id;
      setIsSubmitting(true);
      
      try {
        const t = localStorage.getItem('token');
        const coursePayload = {
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level,
          price: parseFloat(data.price) || 0,
          thumbnail: thumbnailUrl || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop', // Default fallback
          isPublished: true, // Mark as published when submitted from this button
          sections: modules.map((m, index) => ({
            title: m.title || `Module ${index + 1}`,
            lessons: m.lessons.map(l => ({
              title: l.title,
              type: l.type,
              videoUrl: l.type === 'video' ? l.content : '',
              content: l.type === 'text' ? l.content : '',
              duration: 15
            }))
          }))
        };

        const url = isEditing 
          ? `${API_URL}/courses/${id}`
          : `${API_URL}/courses`;
        
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${t}`
          },
          body: JSON.stringify(coursePayload)
        });

        const result = await response.json();
        if (result.success) {
          alert(`Course ${isEditing ? 'Updated' : 'Published'} Successfully!`);
          router.push('/instructor/courses');
        } else if (response.status === 401) {
          alert('Your session has expired or is invalid. We will sign you out. Please sign in again.');
          localStorage.removeItem('token');
          router.push('/auth/login');
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Course operation failed:', error);
      } finally {
        setIsSubmitting(false);
      }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl md:rounded-3xl p-8 md:p-12 text-white border border-white/5 shadow-2xl group flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              <FiZap className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Course Creation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
              {id ? 'Edit' : 'Create New'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">Course</span>
            </h1>
            <p className="text-base text-gray-400 max-w-2xl font-medium leading-relaxed">
              Design a professional learning experience. Configure your content, curriculum, and pricing to reach students worldwide.
            </p>
          </div>

          <div className="hidden md:flex flex-col gap-4 relative z-10 min-w-[200px]">
             {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center space-x-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 ${currentStep >= step ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-gray-900 border-white/5 text-gray-600'}`}>
                      <span className="text-xs font-bold">{step}</span>
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= step ? 'text-white' : 'text-gray-600'}`}>
                      {step === 1 ? 'Details' : step === 2 ? 'Curriculum' : 'Publish'}
                   </span>
                </div>
             ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="bg-gray-900/60 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl space-y-10">
                  <div className="flex items-center space-x-4 border-b border-white/5 pb-8">
                     <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <FiFileText className="h-6 w-6 text-indigo-400" />
                     </div>
                     <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Basic Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Course Title</label>
                        <input 
                          {...register('title', { required: true })}
                          placeholder="What will students learn?"
                          className="w-full bg-black/40 border border-white/5 py-4 px-6 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/30 transition-all"
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
                        <select 
                          {...register('category')}
                          className="w-full bg-black/40 border border-white/5 py-4 px-6 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
                        >
                           <option>Development</option>
                           <option>Design</option>
                           <option>Business</option>
                           <option>Marketing</option>
                        </select>
                     </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Thumbnail Cover</label>
                        <div className="relative group/thumb h-48 rounded-2xl overflow-hidden border border-white/5 bg-black/40">
                           {thumbnailUrl ? (
                             <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                                <FiUpload className="h-6 w-6 text-gray-600" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">High-Res Image Required</span>
                             </div>
                           )}
                           <input 
                             type="file" 
                             className="absolute inset-0 opacity-0 cursor-pointer" 
                             onChange={handleThumbnailUpload}
                             accept="image/*"
                           />
                           {isUploadingThumbnail && (
                             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                             </div>
                           )}
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Course Description</label>
                        <textarea 
                           {...register('description')}
                           placeholder="Provide a detailed overview of your course..."
                           rows={6}
                           className="w-full h-[192px] bg-black/40 border border-white/5 py-6 px-6 rounded-2xl text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-indigo-500/30 transition-all resize-none"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Skill Level</label>
                        <select {...register('level')} className="w-full bg-black/40 border border-white/5 py-4 px-6 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all">
                           <option value="beginner">Beginner</option>
                           <option value="intermediate">Intermediate</option>
                           <option value="advanced">Advanced</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Price ($)</label>
                        <div className="relative">
                           <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                           <input type="number" {...register('price')} placeholder="0.00" className="w-full bg-black/40 border border-white/5 py-4 pl-10 pr-6 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all" />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Language</label>
                        <select {...register('language')} className="w-full bg-black/40 border border-white/5 py-4 px-6 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/30 transition-all">
                           <option>English</option>
                           <option>Spanish</option>
                           <option>French</option>
                           <option>German</option>
                        </select>
                     </div>
                  </div>
               </div>
               
               <div className="flex justify-end pt-4">
                  <Button type="button" onClick={nextStep} className="px-12 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest" variant="primary">
                     Step 2: Curriculum
                     <FiArrowRight className="ml-3 h-4 w-4" />
                  </Button>
               </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="bg-gray-900/60 border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl space-y-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                     <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                           <FiLayers className="h-6 w-6 text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Curriculum Designer</h2>
                     </div>
                     <Button type="button" onClick={addModule} variant="outline" className="px-6 py-2 rounded-xl text-[10px] uppercase font-bold tracking-widest">
                        <FiPlus className="mr-2 h-3.5 w-3.5" />
                        New Module
                     </Button>
                  </div>

                  <div className="space-y-6">
                     {modules.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                           <p className="text-gray-500 text-sm">No modules added yet. Start building your curriculum.</p>
                           <button type="button" onClick={addModule} className="mt-4 text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors">Add first module</button>
                        </div>
                     )}
                     {modules.map((mod, i) => (
                        <div key={mod.id} className="bg-black/40 rounded-2xl p-6 md:p-8 border border-white/5 space-y-6 group relative">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-105">
                                 <span className="text-indigo-400 font-bold">{i + 1}</span>
                              </div>
                              <input 
                                 placeholder="Module Title (e.g. Introduction)"
                                 value={mod.title}
                                 onChange={(e) => updateModule(mod.id, 'title', e.target.value)}
                                 className="flex-1 bg-white/5 border border-transparent py-3 px-6 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/20 transition-all font-medium"
                              />
                              <button type="button" onClick={() => setModules(modules.filter(m => m.id !== mod.id))} className="p-3 text-gray-500 hover:text-rose-500 transition-colors">
                                 <FiTrash2 className="h-4 w-4" />
                              </button>
                           </div>
                           
                           {/* Lesson List */}
                           <div className="space-y-4">
                              {mod.lessons.map((lesson, j) => (
                                 <div key={lesson.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
                                    <div className="flex items-center justify-between gap-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                             {lesson.type === 'video' ? <FiVideo className="h-4 w-4 text-indigo-400" /> : lesson.type === 'live' ? <FiRadio className="h-4 w-4 text-rose-400" /> : <FiFileText className="h-4 w-4 text-indigo-400" />}
                                          </div>
                                          <span className="text-xs font-bold text-white uppercase tracking-widest">Lesson {j + 1}</span>
                                       </div>
                                       <button type="button" onClick={() => removeLesson(mod.id, lesson.id)} className="text-gray-500 hover:text-rose-500 transition-colors">
                                          <FiTrash2 className="h-4 w-4" />
                                       </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <input
                                          placeholder="Lesson Title"
                                          value={lesson.title}
                                          onChange={(e) => updateLesson(mod.id, lesson.id, 'title', e.target.value)}
                                          className="w-full bg-black/40 border border-white/10 py-3 px-4 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition-all"
                                       />
                                       <div className="relative">
                                         <select
                                            value={lesson.type}
                                            onChange={(e) => updateLesson(mod.id, lesson.id, 'type', e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 py-3 px-4 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
                                         >
                                            <option value="video">Recorded Video</option>
                                            <option value="live">Live Session</option>
                                            <option value="text">Text Document</option>
                                            <option value="quiz">Quiz</option>
                                         </select>
                                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            ▼
                                         </div>
                                       </div>
                                    </div>
                                    {lesson.type === 'video' && (
                                        <div className="relative">
                                          <label className={`border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group/upload ${lesson.isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-indigo-600/5 hover:border-indigo-500/30'}`}>
                                             <input 
                                               type="file" 
                                               accept="video/*" 
                                               className="hidden" 
                                               onChange={(e) => {
                                                 if (e.target.files && e.target.files[0]) {
                                                   handleLessonUpload(mod.id, lesson.id, e.target.files[0]);
                                                 }
                                               }}
                                             />
                                             {lesson.isUploading ? (
                                               <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                                             ) : (
                                               <FiUpload className={`h-6 w-6 mb-2 transition-colors ${lesson.content ? 'text-indigo-400' : 'text-gray-500 group-hover/upload:text-indigo-400'}`} />
                                             )}
                                             <p className={`text-[10px] font-black uppercase tracking-widest text-center transition-colors ${lesson.content ? 'text-indigo-400' : 'text-gray-500 group-hover/upload:text-indigo-400'}`}>
                                               {lesson.isUploading ? 'Uploading Video...' : lesson.content ? 'Video Uploaded Successfully' : 'Select Lesson Video'}
                                             </p>
                                          </label>
                                          {lesson.content && !lesson.isUploading && (
                                            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[8px] font-black tracking-widest uppercase">
                                               <FiCheckCircle className="h-3 w-3" /> Ready for Students
                                            </div>
                                          )}
                                        </div>
                                     )}
                                    {lesson.type === 'live' && (
                                       <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                                          <div>
                                             <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Live Session Status</p>
                                             <p className="text-xs text-gray-400 mt-1">Video will appear here automatically after the live stream ends.</p>
                                          </div>
                                          <div className="px-3 py-1.5 bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20 text-white text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                                             <FiRadio className="h-3 w-3 animate-pulse" /> Pending Sync
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>

                           <div className="flex justify-center border border-dashed border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/5 hover:border-indigo-500/30 transition-all group/link" onClick={() => addLesson(mod.id)}>
                              <div className="flex items-center space-x-3 text-gray-500 group-hover/link:text-indigo-400 transition-colors">
                                 <FiPlus className="h-4 w-4" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">Add Lesson</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-between pt-4">
                  <Button type="button" onClick={prevStep} variant="ghost" className="px-10 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center">
                     <FiArrowLeft className="mr-3 h-4 w-4" />
                     Back
                  </Button>
                  <Button type="button" onClick={nextStep} className="px-12 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest" variant="primary">
                     Step 3: Review
                     <FiArrowRight className="ml-3 h-4 w-4" />
                  </Button>
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="bg-gray-900/60 border border-white/5 rounded-3xl p-12 md:p-16 text-center shadow-2xl space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                  
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                     <FiCheckCircle className="h-10 w-10 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-4">
                     <h2 className="text-3xl font-black text-white uppercase tracking-tight">Final Review</h2>
                     <p className="text-gray-400 font-medium max-w-lg mx-auto text-sm leading-relaxed">
                        Verify your course content and curriculum. Once published, your course will be live on the platform.
                     </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-10 border-y border-white/5">
                     <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Modules</p>
                        <p className="text-2xl font-black text-white tracking-tight">{modules.length}</p>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Level</p>
                        <p className="text-2xl font-black text-white uppercase tracking-tight">{watch('level') || 'N/A'}</p>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Price</p>
                        <p className="text-2xl font-black text-white tracking-tight">${watch('price') || '0'}</p>
                     </div>
                     <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-2xl font-black text-emerald-400 tracking-tight uppercase">Ready</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
                     <Button type="button" onClick={prevStep} variant="ghost" className="px-12 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest">
                        Reconfigure
                     </Button>
                     <Button type="submit" className="px-16 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-indigo-600/20" variant="primary">
                        <FiZap className="mr-3 h-4 w-4" />
                        {id ? 'Update Course' : 'Publish Course'}
                     </Button>
                  </div>
               </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
};

CreateCoursePage.allowedRoles = ['instructor', 'admin'];
export default CreateCoursePage;
