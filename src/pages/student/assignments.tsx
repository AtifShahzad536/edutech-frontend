import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiFileText, FiCheck, FiAlertCircle, FiDownload, FiCpu, FiActivity, FiZap, FiLayers, FiShield, FiTrendingUp, FiArrowRight, FiStar } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';
import { selectAssignments } from '@/store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthenticatedPage } from '@/types';

interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  instructor?: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'Active' | 'Reviewing' | 'Completed';
  score?: number;
  maxScore: number;
  submittedAt?: string;
  feedback?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  attachments?: string[];
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const StudentAssignmentsPage: AuthenticatedPage = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, submitted: 0, graded: 0, avgGrade: null as number | null });
  const [loading, setLoading] = useState(true);
  const { isInitialized, token } = useAppSelector((state) => state.auth);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const t = token || localStorage.getItem('token');
        if (!t) return;

        const res = await fetch(`${API}/assignments/my`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await res.json();

        if (result.success) {
          setAssignments(result.data || []);
          setStats(result.stats || { pending: 0, submitted: 0, graded: 0, avgGrade: null });
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialized) fetchData();
  }, [isInitialized, token]);

  const filteredAssignments = assignments.filter(a =>
    filterStatus === 'all' || a.status === filterStatus
  );

  const handleDownload = async (e: React.MouseEvent, url: string, idx: number) => {
    e.preventDefault();
    let downloadUrl = url;
    try {
      const t = token || localStorage.getItem('token');
      // Request signed URL from backend to clear Cloudinary 401s
      const signRes = await fetch(`${API}/uploads/signed-url?url=${encodeURIComponent(url)}`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const signData = await signRes.json();
      
      if (signData.success) {
        downloadUrl = signData.url;
      }
      
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const urlParts = url.split('/');
      let filename = urlParts[urlParts.length - 1] || `resource-${idx + 1}`;
      
      // If the backend generated a ZIP archive (to bypass Cloudinary PDF restrictions),
      // ensure the downloaded file is saved with a .zip extension instead of a .pdf extension.
      if (downloadUrl.includes('generate_archive') || downloadUrl.includes('.zip')) {
        filename = filename.replace(/\.pdf$/i, '.zip');
        // Fallback catch if it somehow didn't have an extension
        if (!filename.endsWith('.zip')) {
          filename += '.zip';
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed via fetch, attempting direct navigation:', error);
      // Fallback: If CORS blocks the fetch, open the signed Cloudinary URL directly!
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-32 space-y-16 animate-in fade-in duration-1000">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group min-h-[350px] flex items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-24 -mt-24 group-hover:bg-indigo-600/20 transition-all duration-1000" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12 w-full">
            <div className="space-y-6 text-center xl:text-left flex-1">
              <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full">
                <FiLayers className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Assignment Tracker</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none text-white">
                My <span className="text-indigo-500">Assignments</span>
              </h1>
              <p className="text-lg text-gray-400 font-medium max-w-2xl leading-relaxed mx-auto xl:mx-0">
                Track your course requirements and stay on top of your learning goals.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto">
              {[
                { label: 'PENDING',   value: loading ? '...' : stats.pending,   color: 'text-amber-400',   icon: FiClock },
                { label: 'SUBMITTED', value: loading ? '...' : stats.submitted, color: 'text-indigo-400',  icon: FiCpu },
                { label: 'GRADED',    value: loading ? '...' : stats.graded,    color: 'text-emerald-400', icon: FiCheck },
                { label: 'AVG GRADE', value: loading ? '...' : (stats.avgGrade !== null ? `${stats.avgGrade}%` : 'N/A'), color: 'text-purple-400', icon: FiTrendingUp },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition-all shadow-xl">
                  <stat.icon className={`h-4 w-4 mx-auto mb-3 ${stat.color} opacity-60`} />
                  <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                  <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-950/50 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-wrap gap-4 justify-center md:justify-start">
          {['all', 'pending', 'submitted', 'graded'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-8 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                filterStatus === status 
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-xl' 
                : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All Assignments' : status}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        <div className="grid grid-cols-1 gap-8">
          {filteredAssignments.map((task) => (
            <div key={task.id} className="group relative bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-10 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
              
              <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10">
                <div className="flex-1 space-y-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                       <FiFileText className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-bold text-white uppercase tracking-tight leading-none group-hover:text-indigo-400 transition-colors">{task.title}</h3>
                       <div className="flex flex-wrap items-center gap-3">
                           <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-md border border-white/5">{task.course}</span>
                           <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-md border border-white/5">Instructor: { (task as any).instructor || 'Course Instructor'}</span>
                       </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-base font-medium leading-relaxed max-w-4xl">"{task.description}"</p>
                  
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
                        <FiLayers className="h-3 w-3" />
                        Reference Materials
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {task.attachments.map((url: string, idx: number) => (
                          <button 
                            key={idx} 
                            onClick={(e) => handleDownload(e, url, idx)}
                            className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all group/file"
                          >
                            <FiDownload className="h-4 w-4 text-indigo-400 group-hover/file:scale-110 transition-transform" />
                            <span>Download Resource {idx + 1}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-6 items-center pt-6 border-t border-white/5">
                    <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                      <FiCalendar className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Due Date: {task.dueDate}</span>
                    </div>
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        task.difficulty === 'Advanced' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        task.difficulty === 'Intermediate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      <FiShield className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{task.difficulty}</span>
                    </div>
                    {task.status === 'graded' && (
                      <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-lg border border-emerald-500/20 text-emerald-400">
                        <FiCheck className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Graded</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center xl:items-end space-y-8 min-w-[240px] w-full xl:w-auto xl:border-l border-white/5 xl:pl-10">
                  {task.status === 'graded' ? (
                    <div className="text-center xl:text-right">
                      <div className="text-6xl font-bold text-white tracking-tight">{task.score}</div>
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2">{task.maxScore} POINTS</div>
                    </div>
                  ) : (
                    <div className="px-8 py-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold uppercase tracking-widest">
                      {task.status}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 w-full">
                    {task.status === 'pending' && (
                      <button 
                        onClick={() => router.push(`/student/assignment-submit/${task.id}`)}
                        className="w-full bg-white hover:bg-gray-100 text-black px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 flex items-center justify-center group/btn"
                      >
                        Start Assignment
                        <FiArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                    {(task.status === 'submitted' || task.status === 'graded') && (
                      <button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 backdrop-blur-3xl">
                        <FiDownload className="h-4 w-4" />
                        Get Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {task.feedback && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="bg-black/60 rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiActivity className="animate-pulse h-3 w-3" />
                        Instructor Feedback
                    </p>
                    <p className="text-gray-400 text-base italic font-medium">"{task.feedback}"</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

StudentAssignmentsPage.allowedRoles = ['student', 'instructor', 'admin'];
export default StudentAssignmentsPage;
