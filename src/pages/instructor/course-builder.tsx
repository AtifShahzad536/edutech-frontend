import React, { useState, useCallback, useRef } from 'react';
import { 
  FiPlus, FiTrash2, FiEdit2, FiSave, FiUpload, FiFileText, 
  FiVideo, FiHelpCircle, FiMoreVertical, 
  FiEye, FiGlobe, FiClock, FiDollarSign, FiImage, FiCheckCircle,
  FiX, FiChevronDown, FiChevronRight, FiMenu
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchCourseById, updateCourse } from '@/store/slices/courseSlice';
import { useEffect } from 'react';
import axios from 'axios';
import { AuthenticatedPage } from '@/types';
import API_URL from '@/config/api';

// Types
interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  videoUrl?: string;
  content?: string;
  resources?: Resource[];
  quiz?: Quiz;
  isPublished: boolean;
}

interface Resource {
  id: string;
  title: string;
  fileType: 'pdf' | 'doc' | 'zip' | 'code';
  url: string;
  size: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  text: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id?: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  sections: Section[];
  learningOutcomes: string[];
  prerequisites: string[];
}

const CourseBuilderPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = router.query;
  const { currentCourse } = useAppSelector(state => state.courses);

  useEffect(() => {
    if (id) {
       dispatch(fetchCourseById(id as string));
    }
  }, [id, dispatch]);

  // Course state
  const [course, setCourse] = useState<Course>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    status: 'draft',
    sections: [],
    learningOutcomes: [''],
    prerequisites: [''],
  });

  useEffect(() => {
    if (currentCourse && id && currentCourse.id === id) {
       setCourse({
          id: currentCourse.id,
          title: currentCourse.title,
          description: currentCourse.description || '',
          category: currentCourse.category || '',
          level: (currentCourse.level as any) || 'beginner',
          price: currentCourse.price || 0,
          thumbnail: currentCourse.thumbnail,
          status: currentCourse.isPublished ? 'published' : 'draft',
          sections: currentCourse.lessons && currentCourse.lessons.length > 0 
            ? [{ id: 'sec-1', title: 'Curriculum', lessons: currentCourse.lessons as any[] }] 
            : [],
          learningOutcomes: [''],
          prerequisites: [''],
       });
    }
  }, [currentCourse, id]);


  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'pricing'>('details');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [draggingItem, setDraggingItem] = useState<{ type: 'section' | 'lesson', id: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Add new section
  const addSection = useCallback(() => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${course.sections.length + 1}`,
      lessons: [],
    };
    setCourse(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setExpandedSections(prev => new Set([...Array.from(prev), newSection.id]));
    setEditingSection(newSection.id);
  }, [course.sections.length]);

  // Delete section
  const deleteSection = useCallback((sectionId: string) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
  }, []);

  // Update section title
  const updateSectionTitle = useCallback((sectionId: string, title: string) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, title } : s
      ),
    }));
  }, []);

  // Add new lesson
  const addLesson = useCallback((sectionId: string, type: Lesson['type']) => {
    const section = course.sections.find(s => s.id === sectionId);
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Lesson`,
      type,
      duration: 0,
      isPublished: false,
    };
    
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, newLesson] }
          : s
      ),
    }));
    
    setEditingLesson(newLesson.id);
    setShowLessonModal(false);
  }, [course.sections]);

  // Delete lesson
  const deleteLesson = useCallback((sectionId: string, lessonId: string) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
          : s
      ),
    }));
  }, []);

  // Update lesson
  const updateLesson = useCallback((sectionId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map(l =>
                l.id === lessonId ? { ...l, ...updates } : l
              ),
            }
          : s
      ),
    }));
  }, []);

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Handle file change and upload to Cloudinary
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, lessonId?: string, isThumbnail: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      // 1. Get signature from backend
      const { data } = await axios.get(`${API_URL}/uploads/signature?folder=courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { signature, timestamp, apiKey, cloudName, folder } = data.data;

      // 2. Prepare upload data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      // 3. Upload to Cloudinary
      const uploadId = lessonId || 'thumbnail';
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData,
        {
          onUploadProgress: (progressEvent: any) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploadProgress(prev => ({ ...prev, [uploadId]: percent }));
          }
        }
      );

      const secureUrl = uploadRes.data.secure_url;

      // 4. Update state
      if (isThumbnail) {
        setCourse(prev => ({ ...prev, thumbnail: secureUrl }));
      } else if (lessonId) {
        // Find section containing this lesson
        setCourse(prev => ({
          ...prev,
          sections: prev.sections.map(s => ({
            ...s,
            lessons: s.lessons.map(l => 
              l.id === lessonId ? { ...l, videoUrl: secureUrl, duration: uploadRes.data.duration || 0 } : l
            )
          }))
        }));
      }

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[uploadId];
        return newProgress;
      });

    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload file. Please try again.');
    }
  }, [course.sections]);

  // Handle file upload trigger
  const [currentUploadRef, setCurrentUploadRef] = useState<{ lessonId?: string, isThumbnail: boolean }>({ isThumbnail: false });
  
  const triggerUpload = useCallback((lessonId?: string, isThumbnail: boolean = false) => {
    setCurrentUploadRef({ lessonId, isThumbnail });
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Calculate total course duration
  const totalDuration = course.sections.reduce(
    (total, section) => total + section.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
    0
  );

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Save course
  const saveCourse = useCallback((publish: boolean = false) => {
    if (!id) return; 
    
    const updatedReduxCourse: any = {
      id: id as string,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      isPublished: publish,
      lessons: course.sections.flatMap((s, sIndex) => s.lessons.map((l, lIndex) => ({
         id: l.id,
         title: l.title,
         type: l.type === 'video' || l.type === 'text' || l.type === 'quiz' ? l.type : 'text',
         duration: l.duration,
         order: (sIndex * 100) + lIndex
      })))
    };
    
    dispatch(updateCourse(updatedReduxCourse));
    alert(publish ? "Course Published Successfully!" : "Course Draft Saved!");
    router.push('/instructor/courses');
    
  }, [course, id, dispatch, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course.id ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-gray-600 mt-2">
              {course.status === 'draft' ? 'Draft - Not published yet' : 'Published and live'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => saveCourse(false)}>
              <FiSave className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => saveCourse(true)}>
              <FiGlobe className="h-4 w-4 mr-2" />
              Publish Course
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            {[
              { id: 'details', label: 'Course Details', icon: FiEdit2 },
              { id: 'content', label: 'Course Content', icon: FiVideo },
              { id: 'pricing', label: 'Pricing', icon: FiDollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Course Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <Input
                    value={course.title}
                    onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={course.description}
                    onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select
                      value={course.category}
                      onChange={(e) => setCourse(prev => ({ ...prev, category: e.target.value }))}
                      options={[
                        { value: '', label: 'Select category' },
                        { value: 'development', label: 'Development' },
                        { value: 'design', label: 'Design' },
                        { value: 'business', label: 'Business' },
                        { value: 'marketing', label: 'Marketing' },
                        { value: 'data-science', label: 'Data Science' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <Select
                      value={course.level}
                      onChange={(e) => setCourse(prev => ({ ...prev, level: e.target.value as any }))}
                      options={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' },
                      ]}
                    />
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Thumbnail
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-40 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <FiImage className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <FiUpload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">What Students Will Learn</h2>
              <div className="space-y-3">
                {course.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={outcome}
                      onChange={(e) => {
                        const newOutcomes = [...course.learningOutcomes];
                        newOutcomes[index] = e.target.value;
                        setCourse(prev => ({ ...prev, learningOutcomes: newOutcomes }));
                      }}
                      placeholder="Enter learning outcome"
                    />
                    <button
                      onClick={() => {
                        const newOutcomes = course.learningOutcomes.filter((_, i) => i !== index);
                        setCourse(prev => ({ ...prev, learningOutcomes: newOutcomes }));
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCourse(prev => ({ ...prev, learningOutcomes: [...prev.learningOutcomes, ''] }))}
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Add Outcome
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Course Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <FiVideo className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {course.sections.reduce((sum, s) => sum + s.lessons.length, 0)} lessons
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDuration(totalDuration)} total
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {course.sections.filter(s => s.lessons.some(l => l.isPublished)).length} sections
                  </span>
                </div>
              </div>
            </div>

            {/* Sections and Lessons */}
            <div className="space-y-4">
              {course.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center space-x-3 flex-1">
                      <FiMenu className="h-5 w-5 text-gray-400 cursor-move" />
                      
                      {editingSection === section.id ? (
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          onBlur={() => setEditingSection(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingSection(null)}
                          className="flex-1 px-2 py-1 border border-primary-300 rounded"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="flex items-center space-x-2 flex-1 text-left"
                        >
                          {expandedSections.has(section.id) ? (
                            <FiChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <FiChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="font-medium text-gray-900">{section.title}</span>
                          <span className="text-sm text-gray-500">
                            ({section.lessons.length} lessons)
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingSection(section.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List */}
                  {expandedSections.has(section.id) && (
                    <div className="p-4 space-y-3">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <FiMenu className="h-4 w-4 text-gray-400 cursor-move" />
                            
                            {lesson.type === 'video' && <FiVideo className="h-4 w-4 text-blue-500" />}
                            {lesson.type === 'text' && <FiFileText className="h-4 w-4 text-gray-500" />}
                            {lesson.type === 'quiz' && <FiHelpCircle className="h-4 w-4 text-purple-500" />}
                            {lesson.type === 'assignment' && <FiEdit2 className="h-4 w-4 text-orange-500" />}
                            
                            <div className="flex-1">
                              {editingLesson === lesson.id ? (
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })}
                                  onBlur={() => setEditingLesson(null)}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingLesson(null)}
                                  className="w-full px-2 py-1 border border-primary-300 rounded"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-900">{lesson.title}</span>
                              )}
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500 capitalize">{lesson.type}</span>
                                {lesson.duration > 0 && (
                                  <span className="text-xs text-gray-500">
                                    • {formatDuration(lesson.duration)}
                                  </span>
                                )}
                                {lesson.isPublished && (
                                  <FiCheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {lesson.type === 'video' && (
                              <div className="flex items-center gap-2">
                                {!lesson.videoUrl ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => triggerUpload(lesson.id, false)}
                                    disabled={uploadProgress[lesson.id] !== undefined}
                                  >
                                    <FiUpload className="h-4 w-4 mr-1" />
                                    {uploadProgress[lesson.id] !== undefined ? `${uploadProgress[lesson.id]}%` : 'Upload'}
                                  </Button>
                                ) : (
                                  <span className="text-xs text-green-500 font-bold">Uploaded</span>
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => setEditingLesson(lesson.id)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteLesson(section.id, lesson.id)}
                              className="p-2 text-red-400 hover:text-red-600"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Buttons */}
                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLesson(section.id, 'video')}
                        >
                          <FiVideo className="h-4 w-4 mr-2" />
                          Video
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLesson(section.id, 'text')}
                        >
                          <FiFileText className="h-4 w-4 mr-2" />
                          Text
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLesson(section.id, 'quiz')}
                        >
                          <FiHelpCircle className="h-4 w-4 mr-2" />
                          Quiz
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLesson(section.id, 'assignment')}
                        >
                          <FiEdit2 className="h-4 w-4 mr-2" />
                          Assignment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Section Button */}
              <Button
                variant="outline"
                className="w-full py-4"
                onClick={addSection}
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Add New Section
              </Button>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Course Pricing</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={course.price}
                    onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Set to 0 for a free course
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Revenue Share</h3>
                <p className="text-sm text-blue-700">
                  You will receive 70% of each sale. Platform fee is 30%.
                </p>
              </div>

              {course.price > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">${course.price}</p>
                    <p className="text-sm text-gray-600">Course Price</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${(course.price * 0.7).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Your Earnings</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      ${(course.price * 0.3).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Platform Fee</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={currentUploadRef.isThumbnail ? "image/*" : "video/*,.pdf,.doc,.docx,.zip"}
          onChange={(e) => handleFileChange(e, currentUploadRef.lessonId, currentUploadRef.isThumbnail)}
        />
      </div>
    </div>
  );
};

CourseBuilderPage.allowedRoles = ['instructor', 'admin'];
export default CourseBuilderPage;
