import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiUser, FiClock, FiThumbsUp, FiMessageSquare, FiShare2, FiFlag, FiBookmark, FiArrowLeft, FiSend, FiCheckCircle, FiInfo, FiCornerDownRight } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { AuthenticatedPage } from '@/types';

const DiscussionThreadPage: AuthenticatedPage = () => {
  const router = useRouter();
  const { threadId } = router.query;
  const { user } = useAppSelector((state) => state.auth);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchThread = useCallback(async (isInitial = true) => {
    if (!threadId) return;
    if (isInitial) setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/discussions/thread/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setThread(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch discussion thread:', error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThread(true);
  }, [fetchThread]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    const loadingToast = toast.loading('Posting reply...', { position: 'top-center' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/discussions/thread/${threadId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText })
      });
      
      const result = await response.json();
      if (result.success) {
        setReplyText('');
        setThread((prev: any) => ({ ...prev, replies: result.data }));
        toast.success('Reply posted', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to post reply.', { id: loadingToast });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleToggleLike = async () => {
    if (!threadId || !user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/discussions/thread/${threadId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setThread((prev: any) => ({ ...prev, likes: result.data }));
        const isNowLiked = result.data.includes(user.id || user._id);
        if (isNowLiked) toast.success('Post liked', { duration: 2000, icon: '🔥' });
      }
    } catch (error) {
      toast.error('Failed to toggle like');
    }
  };

  const handleToggleReplyLike = async (replyId: string) => {
    if (!threadId || !user || !replyId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/discussions/thread/${threadId}/reply/${replyId}/like`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setThread((prev: any) => ({ ...prev, replies: result.data }));
        const currentReply = result.data.find((r: any) => r._id === replyId);
        const isNowLiked = currentReply?.likes?.includes(user.id || user._id);
        if (isNowLiked) toast.success('Reply liked', { duration: 1500, icon: '🙌' });
      }
    } catch (error) {
      toast.error('Failed to like reply');
    }
  };

  const isLikedByMe = thread?.likes?.includes(user?.id || user?._id);

  const handleReplyToUser = (username: string) => {
    setReplyText(prev => `@${username} ${prev}`);
    replyInputRef.current?.focus();
    toast('Tagging user...', { icon: '🏷️', duration: 1500 });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleFlag = () => {
    toast.error('Post reported to moderators');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!thread) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
            <FiInfo className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Thread Not Found</h1>
            <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">The discussion thread you are looking for has been moved.</p>
            <Button onClick={() => router.push('/student/discussions')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[9px] py-4 px-8 rounded-xl shadow-xl transition-all border-0">
               Back to HUB
            </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Nav Header */}
            <div className="flex items-center justify-between px-2 mb-2">
              <button 
                onClick={() => router.push('/student/discussions')}
                className="group flex items-center text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
              >
                <FiArrowLeft className="mr-2 h-3 w-3 transform group-hover:-translate-x-1 transition-transform" />
                Back to Feed
              </button>
            </div>

            {/* Original Post (Header style) */}
            <div className="bg-gray-950 rounded-xl border border-white/5 shadow-xl p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-indigo-600/10 transition-all duration-1000" />
               
               <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[7px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-indigo-500/10">
                    {thread.category || 'General'}
                  </span>
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2 border-l border-white/10">
                    {thread.course?.title || 'Global Community'}
                  </span>
               </div>

               <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-[1.1] mb-6">
                 {thread.title}
               </h1>

               {/* Post Meta */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center p-0.5 shadow-lg group-hover:shadow-indigo-500/20 transition-all">
                       {thread.user?.avatar ? (
                         <img src={thread.user.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                       ) : (
                         <div className="w-full h-full bg-gray-950 rounded-[9px] flex items-center justify-center text-indigo-400 font-black text-xs uppercase">
                           {thread.user?.firstName?.[0] || 'U'}
                         </div>
                       )}
                    </div>
                    <div className="space-y-0.5">
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-black text-white tracking-tight uppercase leading-none">
                           {thread.user?.firstName} {thread.user?.lastName}
                         </span>
                         <span className="bg-white/5 border border-white/5 text-[7px] text-gray-500 font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                           {thread.user?.role || 'Student'}
                         </span>
                       </div>
                       <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                         <FiClock className="h-2.5 w-2.5" />
                         {formatDate(thread.createdAt)}
                       </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                       onClick={handleToggleLike}
                       className={clsx(
                         "flex items-center gap-2 px-5 py-2.5 rounded-lg font-black uppercase tracking-widest text-[8px] transition-all border",
                         isLikedByMe ? "bg-indigo-600 text-white border-indigo-500 shadow-lg" : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                       )}
                    >
                       <FiThumbsUp className={clsx("h-2.5 w-2.5", isLikedByMe && "fill-current")} />
                       {isLikedByMe ? 'Liked' : 'Like'} {thread.likes?.length > 0 && `(${thread.likes.length})`}
                    </button>
                    <button 
                       onClick={handleShare}
                       className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-white transition-all shadow-lg"
                       title="Copy Link"
                    >
                       <FiShare2 className="h-3 w-3" />
                    </button>
                    <button 
                       onClick={handleFlag}
                       className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-500 hover:text-rose-500 transition-all shadow-lg"
                       title="Flag Post"
                    >
                       <FiFlag className="h-3 w-3" />
                    </button>
                  </div>
               </div>

               {/* Post Content */}
               <div className="prose prose-invert max-w-none mb-6">
                 <div className="text-base text-gray-400 leading-relaxed font-medium whitespace-pre-wrap selection:bg-indigo-500/30 selection:text-white">
                   {thread.content}
                 </div>
               </div>

               {/* Floating Actions */}
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setIsBookmarked(!isBookmarked)}
                   className={clsx(
                     "flex items-center gap-2 px-4 py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all",
                     isBookmarked ? "bg-indigo-600 border-indigo-400 text-white shadow-lg" : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                   )}
                 >
                   <FiBookmark className={clsx("h-3 w-3", isBookmarked && "fill-current")} />
                   {isBookmarked ? 'Saved' : 'Save'}
                 </button>
               </div>
            </div>

            {/* Replies Scrollable Stream */}
            <div className="space-y-4 pt-6">
               <div className="flex items-center justify-between px-2 mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">Thread Conversation</h2>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">{thread.replies?.length || 0} Replies</span>
                  </div>
               </div>

               {/* Replies Feed (Slack style) */}
               <div className="space-y-3">
                  {thread.replies && thread.replies.length > 0 ? (
                    thread.replies.map((reply: any, idx: number) => (
                      <div key={reply._id || idx} className="bg-gray-950 rounded-xl border border-white/5 p-5 group hover:border-white/10 transition-all relative overflow-hidden">
                          <div className="flex items-start gap-4 relative z-10">
                             <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center p-0.5 shadow-xl flex-shrink-0">
                                {reply.user?.avatar ? (
                                  <img src={reply.user.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-gray-900 rounded-[9px] flex items-center justify-center text-gray-600 font-bold text-[10px] uppercase">
                                    {reply.user?.firstName?.[0] || 'U'}
                                  </div>
                                )}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                   <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="text-xs font-black text-white tracking-widest uppercase truncate leading-none">
                                         {reply.user?.firstName} {reply.user?.lastName}
                                      </span>
                                      {reply.user?.role === 'instructor' && (
                                        <span className="bg-indigo-500/10 text-indigo-400 text-[6px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest flex-shrink-0">INST</span>
                                      )}
                                      <span className="text-[7px] font-bold text-gray-700 uppercase tracking-widest whitespace-nowrap hidden sm:block">• {formatDate(reply.createdAt)}</span>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleReplyToUser(reply.user?.firstName || 'User')}
                                        className="text-[8px] font-black text-gray-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-1"
                                      >
                                         <FiCornerDownRight className="h-2.5 w-2.5" />
                                         Mention
                                      </button>
                                      <button 
                                        onClick={() => handleToggleReplyLike(reply._id)}
                                        className={clsx(
                                          "flex items-center gap-1 text-[8px] font-black transition-colors px-1 uppercase tracking-widest",
                                          reply.likes?.includes(user?.id || user?._id) ? "text-indigo-400" : "text-gray-700 hover:text-indigo-400"
                                        )}
                                      >
                                         <FiThumbsUp className={clsx("h-2.5 w-2.5", reply.likes?.includes(user?.id || user?._id) && "fill-current")} />
                                         {reply.likes?.length > 0 && reply.likes.length}
                                      </button>
                                   </div>
                                </div>
                                <div className="text-xs text-gray-400 font-medium leading-relaxed prose prose-invert max-w-none break-words">
                                   {reply.content}
                                </div>
                             </div>
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-black/20 rounded-xl border border-dashed border-white/5">
                        <FiMessageSquare className="h-8 w-8 text-white/5 mx-auto mb-3" />
                        <h3 className="text-xs font-black text-gray-700 uppercase tracking-tight">No replies yet</h3>
                        <p className="text-[7px] font-black text-gray-800 uppercase tracking-[0.2em] mt-1">Be the first contributor</p>
                    </div>
                  )}
               </div>

               {/* Sticky Compact Reply Form */}
               <div className="sticky bottom-4 z-20 pt-4">
                  <form onSubmit={handleSubmitReply} className="bg-gray-950 rounded-xl border border-indigo-500/20 p-4 shadow-2xl relative group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all flex items-end gap-4 backdrop-blur-3xl">
                     <div className="flex-1">
                        <textarea 
                          ref={replyInputRef}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Compose your reply..."
                          className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder-gray-800 font-medium resize-none min-h-[40px] max-h-[200px] text-xs scrollbar-none py-1"
                          onInput={(e) => {
                             const target = e.target as HTMLTextAreaElement;
                             target.style.height = 'inherit';
                             target.style.height = `${target.scrollHeight}px`;
                          }}
                        />
                     </div>
                     <button 
                       type="submit"
                       disabled={!replyText.trim() || isSubmittingReply}
                       className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg shadow-xl border-0 transition-all disabled:opacity-50 disabled:grayscale"
                     >
                        <FiSend className={clsx("h-4 w-4", isSubmittingReply && "animate-pulse")} />
                     </button>
                  </form>
                  <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest text-center mt-2">Press enter to send via desktop</p>
               </div>
            </div>
          </div>

          {/* Sidebar Area (Compact & Fixed) */}
          <div className="lg:col-span-1">
             <div className="space-y-6 lg:sticky lg:top-4">
                {/* Stats */}
                <div className="bg-gray-950 border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-600/5 rounded-full blur-[20px]" />
                   <h3 className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-4">Post Insights</h3>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Views</span>
                         <span className="text-[10px] font-black text-white">{thread.views}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Replies</span>
                         <span className="text-[10px] font-black text-white">{thread.replies?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Category</span>
                         <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-widest text-right">{thread.category || 'General'}</span>
                      </div>
                   </div>
                </div>

                {/* Related Context */}
                <div className="bg-gray-950 border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden group/sidebar">
                   <h3 className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-4">Original Context</h3>
                   <div className="bg-white/5 rounded-lg p-3 border border-white/5 group-hover/sidebar:border-indigo-500/20 transition-all cursor-default">
                      <div className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">{thread.course?.category || 'Learning'}</div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight leading-tight">
                        {thread.course?.title || 'Community Learning Hub'}
                      </p>
                   </div>
                </div>

                {/* Rules */}
                <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-xl p-6 relative overflow-hidden group">
                   <h3 className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-4">Reals</h3>
                   <ul className="text-[8px] font-bold text-gray-600 space-y-3 relative z-10 uppercase tracking-wider leading-relaxed">
                     <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-rose-500/50 mt-0.5 mr-2 flex-shrink-0" />
                        Summarize long replies
                     </li>
                     <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-rose-500/50 mt-0.5 mr-2 flex-shrink-0" />
                        Use @Username to mention
                     </li>
                     <li className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-rose-500/50 mt-0.5 mr-2 flex-shrink-0" />
                        Report community violations
                     </li>
                   </ul>
                </div>
             </div>
          </div> {/* End of Sidebar Area */}
        </div> {/* End of Grid */}
      </div> {/* End of Container */}
    </DashboardLayout>
  );
};

DiscussionThreadPage.allowedRoles = ['student', 'instructor', 'admin'];
export default DiscussionThreadPage;
