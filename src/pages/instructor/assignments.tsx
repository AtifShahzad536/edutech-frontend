import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  FiPlus, FiLayers, FiClock, FiFileText, 
  FiTrendingUp, FiVideo, FiArrowRight, 
  FiCheckCircle, FiPlusCircle, FiAlertCircle,
  FiSearch, FiFilter, FiMoreVertical, FiEdit3, FiTrash2, FiUsers,
  FiX, FiActivity
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { selectAssignments } from '@/store';
import { addAssignment } from '@/store/slices/assignmentSlice';
import { AuthenticatedPage } from '@/types';
import clsx from 'clsx';
import API_URL from '@/config/api';

const InstructorAssignmentsPage: AuthenticatedPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const { user, isInitialized, token } = useAppSelector(state => state.auth);
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    courseId: '',
    description: '',
    dueDate: '',
    difficulty: 'Intermediate',
    attachments: [] as string[]
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit Assignment State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState({
    id: '',
    title: '',
    courseId: '',
    description: '',
    dueDate: '',
    difficulty: 'Intermediate',
    attachments: [] as string[]
  });

  // Submission Viewing State
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingData, setGradingData] = useState({ submissionId: '', grade: 0, feedback: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCourses(true);
      try {
        const t = localStorage.getItem('token');
        if (!t) {
          router.push('/login');
          return;
        }
        
        // 1. Fetch instructor's courses to populate create select
        const coursesRes = await fetch(`${API_URL}/instructor/courses`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        
        if (coursesRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const coursesResult = await coursesRes.json();
        if (coursesResult.success) {
          setInstructorCourses(coursesResult.data);
          if (coursesResult.data.length > 0 && !newAssignment.courseId) {
            setNewAssignment(prev => ({ ...prev, courseId: coursesResult.data[0]._id }));
          }
        } else {
          setCoursesError(coursesResult.message || 'Failed to load courses');
        }

        // 2. Fetch all assignments for instructor
        const res = await fetch(`${API_URL}/assignments/instructor`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await res.json();
        if (result.success) {
          setAssignments(result.data);
        }

      } catch (error) {
        console.error('Failed to fetch instructor assignment data:', error);
        setCoursesError('Network error. Click to retry.');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (isInitialized && (token || localStorage.getItem('token'))) {
      fetchData();
    }
  }, [isInitialized, token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/uploads/assignment-file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${t}`
        },
        body: formData
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setNewAssignment(prev => ({
          ...prev,
          attachments: [...prev.attachments, result.data]
        }));
      } else {
        setUploadError(result.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({
          title: newAssignment.title,
          description: newAssignment.description,
          course: newAssignment.courseId,
          dueDate: newAssignment.dueDate,
          totalPoints: 100,
          attachments: newAssignment.attachments
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const result = await response.json();
      if (result.success) {
        // Find the course title for the local state update
        const course = instructorCourses.find(c => c._id === newAssignment.courseId);
        
        // Update local state instead of reloading
        const newlyCreated = {
          id: result.data._id,
          title: result.data.title,
          course: course?.title || 'Unknown Course',
          description: result.data.description,
          dueDate: new Date(result.data.dueDate).toLocaleDateString(),
          submissions: 0,
          totalStudents: course?.studentsCount || 0,
          status: 'Active',
          difficulty: 'Intermediate',
          maxScore: 100
        };
        
        setAssignments([newlyCreated, ...assignments]);
        setShowCreateModal(false);
        setNewAssignment({
          title: '',
          courseId: instructorCourses[0]?._id || '',
          description: '',
          dueDate: '',
          difficulty: 'Intermediate',
          attachments: []
        });
        alert("Assignment Published Successfully!");
      }
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert("Error publishing assignment. Please try again.");
    }
  };

  const handleEditClick = (assignment: any) => {
    // Format the date if it's stored as an ISO string or formatted string
    let formattedDate = '';
    if (assignment.dueDate) {
       try {
         const d = new Date(assignment.dueDate);
         if (!isNaN(d.getTime())) {
           formattedDate = d.toISOString().split('T')[0];
         }
       } catch (e) {
         // fallback
       }
    }
    
    setEditingAssignment({
      id: assignment.id,
      title: assignment.title || '',
      courseId: assignment.courseId || instructorCourses[0]?._id || '',
      description: assignment.description || '',
      dueDate: formattedDate,
      difficulty: assignment.difficulty || 'Intermediate',
      attachments: assignment.attachments || []
    });
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/${editingAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({
          title: editingAssignment.title,
          description: editingAssignment.description,
          course: editingAssignment.courseId,
          dueDate: editingAssignment.dueDate,
          difficulty: editingAssignment.difficulty,
          totalPoints: 100,
          attachments: editingAssignment.attachments
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const course = instructorCourses.find(c => c._id === editingAssignment.courseId);
          // Update local state without refreshing
          setAssignments(assignments.map(a => 
            a.id === editingAssignment.id ? {
              ...a,
              title: result.data.title,
              description: result.data.description,
              course: course?.title || a.course,
              courseId: editingAssignment.courseId,
              dueDate: new Date(result.data.dueDate).toLocaleDateString(),
              difficulty: result.data.difficulty,
              attachments: result.data.attachments
            } : a
          ));
          setShowEditModal(false);
          alert("Assignment Updated Successfully!");
        }
      } else {
         alert("Error updating assignment.");
      }
    } catch (error) {
      console.error('Failed to update assignment:', error);
      alert("Network error updating assignment.");
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone and will delete all student submissions.`)) {
      return;
    }
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` }
      });

      if (response.ok) {
        setAssignments(assignments.filter(a => a.id !== id));
      } else {
        alert("Failed to delete assignment.");
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  const handleViewSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/${assignment.id}/submissions`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const result = await response.json();
      if (result.success) {
        setSubmissions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/submissions/${gradingData.submissionId}/grade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({
          grade: gradingData.grade,
          feedback: gradingData.feedback
        })
      });

      const result = await response.json();
      if (result.success) {
        alert("Grade Published!");
        // Update local submissions state
        setSubmissions(submissions.map(s => s._id === gradingData.submissionId ? { ...s, status: 'graded', grade: gradingData.grade, feedback: gradingData.feedback } : s));
        setGradingData({ submissionId: '', grade: 0, feedback: '' });
      }
    } catch (error) {
      console.error('Failed to grade submission:', error);
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 md:space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl md:rounded-3xl p-8 md:p-12 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400">
                <FiLayers className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black tracking-widest uppercase">Assignment Manager</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Tasks</span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 max-w-xl font-medium">
                Create and track course assignments to keep your students engaged and monitor their progress.
              </p>
            </div>
            
            <Button 
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl active:scale-95 flex items-center gap-3 border-0"
            >
              <FiPlusCircle className="h-5 w-5" />
              Create Assignment
            </Button>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
           <div className="relative w-full lg:w-96 group">
             <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
             <input 
               type="text" 
               placeholder="Search assignments..."
               className="w-full bg-gray-900/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-6 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-all font-medium"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>

           <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <FiCheckCircle className="text-emerald-400" />
                <span>24 Completed</span>
             </div>
             <div className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <FiClock className="text-amber-400" />
                <span>12 Pending</span>
             </div>
           </div>
        </div>

        {/* Assignments Table/List */}
        <div className="bg-gray-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[60px] -mr-20 -mt-20" />
            
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Assignment & Course</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">Due Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Submissions</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden lg:table-cell">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl group-hover:scale-110 transition-transform duration-500">
                             <FiFileText className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{assignment.title}</h4>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{assignment.course}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                           <FiClock className="h-3.5 w-3.5 text-gray-600" />
                           {assignment.dueDate}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2 max-w-[120px]">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black text-white">{assignment.submissions} / {assignment.totalStudents}</span>
                              <span className="text-[8px] font-bold text-gray-600 uppercase">Submissions</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 transition-all duration-1000" 
                                style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }} 
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden lg:table-cell">
                         <span className={clsx(
                           "text-[9px] font-black px-3 py-1 rounded-full border tracking-widest uppercase",
                           assignment.status === 'Active' ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                           assignment.status === 'Reviewing' ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                           "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
                         )}>
                           {assignment.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleViewSubmissions(assignment)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-[9px] font-bold uppercase transition-all flex items-center gap-2"
                            >
                               <FiUsers className="h-3 w-3" />
                               View Work
                            </button>
                            <button 
                               onClick={() => handleEditClick(assignment)}
                               className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                               <FiEdit3 className="h-4 w-4" />
                            </button>
                            <button 
                               onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                               className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            >
                               <FiTrash2 className="h-4 w-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)} />
            
            <div className="relative w-full max-w-xl bg-gray-950 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
               
               <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">New Assignment</h2>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Define the requirements for your task</p>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                    <FiPlus className="rotate-45 h-6 w-6" />
                  </button>
               </div>

               <form onSubmit={handleCreateAssignment} className="space-y-6">
                 <Input 
                   label="Assignment Title"
                   placeholder="e.g. Master-Detail UI in React"
                   value={newAssignment.title}
                   onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                   required
                   className="!bg-white/[0.02]"
                 />

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Select Course</label>
                        <select 
                         className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-5 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/30 transition-all font-medium appearance-none"
                         value={newAssignment.courseId}
                         onChange={(e) => setNewAssignment({...newAssignment, courseId: e.target.value})}
                         disabled={loadingCourses}
                        >
                          {loadingCourses ? (
                            <option className="bg-gray-950 italic">Loading Courses...</option>
                          ) : instructorCourses.length > 0 ? (
                            instructorCourses.map(course => (
                              <option key={course._id} value={course._id} className="bg-gray-950">{course.title}</option>
                            ))
                          ) : (
                            <option className="bg-gray-950 text-red-400">No Courses Found</option>
                          )}
                        </select>
                        {coursesError && <p className="text-[8px] font-bold text-red-500 uppercase mt-1">{coursesError}</p>}
                    </div>
                    
                    <Input 
                      label="Due Date"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                      required
                      className="!bg-white/[0.02]"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Task Description</label>
                    <textarea 
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/30 transition-all font-medium min-h-[120px]"
                      placeholder="Explain the technical requirements and learning objectives..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                      required
                    />
                 </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Assignment Document (Optional)</label>
                     <div className="flex flex-col gap-4">
                        {newAssignment.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {newAssignment.attachments.map((url, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black text-indigo-400 tracking-widest uppercase">
                                <FiFileText className="h-3 w-3" />
                                <span>Attached File {idx + 1}</span>
                                <button type="button" onClick={() => setNewAssignment(prev => ({...prev, attachments: prev.attachments.filter((_, i) => i !== idx)}))}>
                                  <FiPlus className="rotate-45 h-3 w-3 hover:text-white transition-colors" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="relative group">
                           <input 
                             type="file" 
                             className="hidden" 
                             id="assignment-file-upload"
                             onChange={handleFileUpload}
                             disabled={isUploading}
                           />
                           <label 
                            htmlFor="assignment-file-upload"
                            className={clsx(
                              "w-full flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-6 cursor-pointer transition-all",
                              isUploading ? "bg-white/5 border-white/10 opacity-50" : "bg-white/[0.02] border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04]"
                            )}
                           >
                            {isUploading ? (
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <FiPlusCircle className="h-5 w-5 text-gray-600" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Choose Document</span>
                              </>
                            )}
                           </label>
                           {uploadError && <p className="text-[9px] font-bold text-red-500 uppercase mt-2">{uploadError}</p>}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Difficulty Level</label>
                       <div className="grid grid-cols-3 gap-2">
                         {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                           <button
                             key={level}
                             type="button"
                             onClick={() => setNewAssignment({...newAssignment, difficulty: level})}
                             className={clsx(
                               "py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all border",
                               newAssignment.difficulty === level 
                               ? "bg-indigo-600 text-white border-indigo-400 shadow-lg"
                               : "bg-white/5 text-gray-600 border-white/5 hover:bg-white/10"
                             )}
                           >
                             {level}
                           </button>
                         ))}
                       </div>
                    </div>

                    <div className="flex flex-col justify-end">
                       <Button type="submit" variant="primary" className="w-full py-4 text-[10px] font-black uppercase tracking-widest" disabled={isUploading}>
                          Publish Task
                       </Button>
                    </div>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Edit Assignment Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowEditModal(false)} />
            
            <div className="relative w-full max-w-xl bg-gray-950 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
               
               <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Edit Assignment</h2>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Update the requirements for your task</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                    <FiPlus className="rotate-45 h-6 w-6" />
                  </button>
               </div>

               <form onSubmit={handleUpdateAssignment} className="space-y-6">
                 <Input 
                   label="Assignment Title"
                   value={editingAssignment.title}
                   onChange={(e) => setEditingAssignment({...editingAssignment, title: e.target.value})}
                   required
                   className="!bg-white/[0.02]"
                 />

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Select Course</label>
                        <select 
                         className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-5 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500/30 transition-all font-medium appearance-none"
                         value={editingAssignment.courseId}
                         onChange={(e) => setEditingAssignment({...editingAssignment, courseId: e.target.value})}
                         disabled={loadingCourses}
                        >
                          {instructorCourses.map(course => (
                            <option key={course._id} value={course._id} className="bg-gray-950">{course.title}</option>
                          ))}
                        </select>
                    </div>
                    
                    <Input 
                      label="Due Date"
                      type="date"
                      value={editingAssignment.dueDate}
                      onChange={(e) => setEditingAssignment({...editingAssignment, dueDate: e.target.value})}
                      required
                      className="!bg-white/[0.02]"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Task Description</label>
                    <textarea 
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/30 transition-all font-medium min-h-[120px]"
                      value={editingAssignment.description}
                      onChange={(e) => setEditingAssignment({...editingAssignment, description: e.target.value})}
                      required
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Assignment Document</label>
                    <div className="flex flex-col gap-4">
                       {editingAssignment.attachments.length > 0 && (
                         <div className="flex flex-wrap gap-2">
                           {editingAssignment.attachments.map((url, idx) => (
                             <div key={idx} className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black text-indigo-400 tracking-widest uppercase">
                               <FiFileText className="h-3 w-3" />
                               <span>Attached File {idx + 1}</span>
                               <button type="button" onClick={() => setEditingAssignment(prev => ({...prev, attachments: prev.attachments.filter((_, i) => i !== idx)}))}>
                                 <FiPlus className="rotate-45 h-3 w-3 hover:text-white transition-colors" />
                               </button>
                             </div>
                           ))}
                         </div>
                       )}
                       
                       <div className="relative group">
                          <input 
                            type="file" 
                            className="hidden" 
                            id="assignment-file-upload-edit"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploading(true);
                              const formData = new FormData();
                              formData.append('file', file);
                              try {
                                const t = localStorage.getItem('token');
                                const response = await fetch(`${API_URL}/uploads/assignment-file`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${t}` },
                                  body: formData
                                });
                                const result = await response.json();
                                if (result.success) {
                                  setEditingAssignment(prev => ({ ...prev, attachments: [...prev.attachments, result.data] }));
                                }
                              } finally {
                                setIsUploading(false);
                              }
                            }}
                            disabled={isUploading}
                          />
                          <label 
                           htmlFor="assignment-file-upload-edit"
                           className={clsx(
                             "w-full flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-6 cursor-pointer transition-all",
                             isUploading ? "bg-white/5 border-white/10 opacity-50" : "bg-white/[0.02] border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04]"
                           )}
                          >
                           {isUploading ? (
                             <div className="flex items-center gap-3">
                               <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uploading...</span>
                             </div>
                           ) : (
                             <>
                               <FiPlusCircle className="h-5 w-5 text-gray-600" />
                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Add Document</span>
                             </>
                           )}
                          </label>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Difficulty Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setEditingAssignment({...editingAssignment, difficulty: level})}
                            className={clsx(
                              "py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all border",
                              editingAssignment.difficulty === level 
                              ? "bg-indigo-600 text-white border-indigo-400 shadow-lg"
                              : "bg-white/5 text-gray-600 border-white/5 hover:bg-white/10"
                            )}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="flex flex-col justify-end">
                      <Button type="submit" variant="primary" className="w-full py-4 text-[10px] font-black uppercase tracking-widest" disabled={isUploading}>
                         Save Changes
                      </Button>
                   </div>
                 </div>
               </form>
            </div>
          </div>
        )}

        {/* View Submissions Modal */}
        {showSubmissionsModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowSubmissionsModal(false)} />
            
            <div className="relative w-full max-w-5xl bg-gray-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
               
               <div className="p-8 md:p-12 border-b border-white/5 relative z-10 flex items-center justify-between bg-white/[0.02]">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">{selectedAssignment?.title}</h2>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{submissions.length} Active Submissions</p>
                  </div>
                  <button onClick={() => setShowSubmissionsModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all shadow-xl group">
                    <FiX className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 relative z-10 custom-scrollbar">
                  {loadingSubmissions ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4">
                       <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                       <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Scanning Repository...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                       {submissions.length === 0 && (
                         <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <FiActivity className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No deployments found yet.</p>
                         </div>
                       )}
                       {submissions.map((sub: any) => (
                         <div key={sub._id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 group hover:border-indigo-500/20 transition-all">
                            <div className="flex flex-col xl:flex-row gap-8">
                               <div className="flex-1 space-y-6">
                                  <div className="flex items-center gap-5">
                                     <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center overflow-hidden">
                                        {sub.student?.avatar ? <img src={sub.student.avatar} alt="" className="w-full h-full object-cover" /> : <FiUsers className="h-6 w-6 text-indigo-400" />}
                                     </div>
                                     <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">{sub.student?.firstName} {sub.student?.lastName}</h4>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sub.student?.email}</p>
                                     </div>
                                  </div>

                                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                                     <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] font-black uppercase text-indigo-400 tracking-widest">DEPLOYED LINK</div>
                                     </div>
                                     <a 
                                      href={sub.content.startsWith('http') ? sub.content : '#'} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="block text-indigo-400 hover:text-indigo-300 font-medium break-all text-sm underline decoration-indigo-500/30 underline-offset-4"
                                     >
                                        {sub.content}
                                     </a>
                                     <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Submitted At: {new Date(sub.submittedAt).toLocaleString()}</p>
                                  </div>
                               </div>

                               <div className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-white/5 pt-8 xl:pt-0 xl:pl-8">
                                  {sub.status === 'graded' ? (
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center space-y-4">
                                       <div className="text-4xl font-black text-emerald-400">{sub.grade}</div>
                                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">"{sub.feedback}"</p>
                                       <div className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Status: Graded</div>
                                    </div>
                                  ) : (
                                    <form onSubmit={handleGradeSubmission} className="space-y-4">
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Assign Score (0-100)</label>
                                          <input 
                                            type="number" 
                                            required
                                            max={100}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-indigo-500/40 outline-none"
                                            onChange={(e) => setGradingData({...gradingData, submissionId: sub._id, grade: parseInt(e.target.value)})}
                                          />
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Feedback Notes</label>
                                          <textarea 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-indigo-500/40 outline-none min-h-[80px]"
                                            placeholder="Code quality, architecture..."
                                            onChange={(e) => setGradingData({...gradingData, submissionId: sub._id, feedback: e.target.value})}
                                          />
                                       </div>
                                       <Button type="submit" variant="primary" fullWidth className="py-3 text-[9px] uppercase font-black tracking-widest">
                                          Publish Grade
                                       </Button>
                                    </form>
                                  )}
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

InstructorAssignmentsPage.allowedRoles = ['instructor', 'admin'];
export default InstructorAssignmentsPage;
