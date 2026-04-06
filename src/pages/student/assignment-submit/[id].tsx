import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUpload, FiCheckCircle, FiFile, FiArrowLeft, FiSend, FiZap } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { selectAssignmentById } from '@/store';
import { updateAssignmentStatus } from '@/store/slices/assignmentSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { AuthenticatedPage } from '@/types';

const AssignmentSubmitPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = router.query;
  const [assignment, setAssignment] = useState<any>(null);
  const { user, isInitialized, token } = useAppSelector((state) => state.auth);
  
  const [submissionType, setSubmissionType] = useState<'file' | 'link'>('file');
  const [submissionLink, setSubmissionLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const t = localStorage.getItem('token');
        // Since we don't have a single GET /assignment/:id, we search in the course assignments
        // Or we could add a dedicated endpoint. Let's assume we can fetch it if we have the courseId.
        // Actually, let's just fetch it by ID if we add a GET /api/assignments/:id route.
        // I'll add that route in the next step. For now, let's assume it exists.
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/assignments/${id}`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await res.json();
        if (result.success) {
          setAssignment({
            id: result.data._id,
            title: result.data.title,
            course: result.data.course?.title || 'General',
            dueDate: new Date(result.data.dueDate).toLocaleDateString()
          });
        }
      } catch (error) {
        console.error('Failed to fetch assignment details:', error);
      }
    };

    if (id && isInitialized && (token || localStorage.getItem('token'))) {
      fetchAssignment();
    }
  }, [id, isInitialized, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const t = localStorage.getItem('token');
      let finalContent = submissionLink;
      let finalAttachments: string[] = [];

      // 1. If it's a file submission, upload the file first
      if (submissionType === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/assignment-file`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` },
          body: formData
        });

        const uploadResult = await uploadRes.json();
        if (uploadResult.success) {
          finalContent = `File: ${uploadResult.originalName}`;
          finalAttachments = [uploadResult.data];
        } else {
          throw new Error(uploadResult.message || 'File upload failed');
        }
      } else if (submissionType === 'file' && !selectedFile) {
        alert('Please select a file to upload');
        setIsSubmitting(false);
        return;
      }

      // 2. Submit the assignment with the URL/Link
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/assignments/${id}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}` 
        },
        body: JSON.stringify({
          content: finalContent,
          attachments: finalAttachments
        })
      });
      
      const result = await response.json();
      if (result.success) {
        dispatch(addNotification({
          id: Date.now().toString(),
          userId: user?.id || 'guest',
          type: 'system',
          title: 'Assignment Submitted',
          message: `Your work for ${assignment.title} has been received for review.`,
          isRead: false,
          createdAt: new Date().toISOString()
        }));
        setIsDone(true);
      } else if (response.status === 401) {
        alert('Your session has expired. We will sign you out. Please sign in again.');
        localStorage.removeItem('token');
        router.push('/auth/login');
      } else {
        alert(result.message || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Submission failed:', error);
      alert(error.message || 'Network error. Check connection to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Searching for task...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isDone) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <FiCheckCircle className="h-10 w-10 text-emerald-400" />
           </div>
           <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Transmission Complete</h2>
              <p className="text-gray-500 text-sm font-medium">Your submission has been secured. The instructor will review your work shortly.</p>
           </div>
           <Button onClick={() => router.push('/student/assignments')} variant="secondary" className="px-10">
              Return to Registry
           </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
        
        <button onClick={() => router.back()} className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors group">
           <FiArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-widest">Abort & Back</span>
        </button>

        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20" />
          
          <div className="relative z-10 space-y-10">
             <div className="space-y-4">
               <div className="inline-flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
                  <FiZap className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Submission Interface</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">{assignment.title}</h1>
               <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  <span>{assignment.course}</span>
                  <span>•</span>
                  <span>Due: {assignment.dueDate}</span>
               </div>
             </div>

             <div className="bg-black/40 border border-white/5 rounded-2xl p-8 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
                      <button 
                        type="button"
                        onClick={() => setSubmissionType('file')}
                        className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${submissionType === 'file' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                         File Archive
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSubmissionType('link')}
                        className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${submissionType === 'link' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                         External Link
                      </button>
                   </div>

                   {submissionType === 'file' ? (
                     <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center space-y-6 hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden"
                     >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <FiUpload className="h-6 w-6 text-gray-400 group-hover:text-indigo-400" />
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-bold text-white uppercase tracking-tight">
                             {selectedFile ? selectedFile.name : 'Deploy files to review'}
                           </p>
                           <p className="text-[10px] text-gray-600 mt-2 font-medium uppercase tracking-widest">
                             {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'ZIP, PDF or TXT up to 10MB'}
                           </p>
                        </div>
                        {selectedFile && (
                          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-full animate-in slide-in-from-left duration-1000" />
                        )}
                     </div>
                   ) : (
                     <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2">Production URL</label>
                        <input 
                           type="url" 
                           placeholder="https://github.com/your-repo"
                           className="w-full bg-black/60 border border-white/10 rounded-xl py-4 px-6 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/30 transition-all"
                           value={submissionLink}
                           onChange={(e) => setSubmissionLink(e.target.value)}
                           required
                        />
                     </div>
                   )}

                   <Button 
                      type="submit" 
                      fullWidth 
                      disabled={isSubmitting}
                      className="py-5 bg-white hover:bg-gray-100 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          Encrypting...
                        </>
                      ) : (
                        <>
                          <FiSend className="h-4 w-4" />
                          Transmit Work
                        </>
                      )}
                   </Button>
                </form>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

AssignmentSubmitPage.allowedRoles = ['student', 'instructor', 'admin'];
export default AssignmentSubmitPage;
