import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiPlus, FiMessageSquare, FiThumbsUp, FiClock, FiFilter } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { AuthenticatedPage } from '@/types';

const StudentDiscussionsPage: AuthenticatedPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDiscussions = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        // For now, we fetch all discussions. In the future, this could be filtered by courseId.
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/discussions/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          const mapped = result.data.map((d: any) => ({
            id: d._id,
            title: d.title,
            author: { 
              name: `${d.user.firstName} ${d.user.lastName}`, 
              avatar: d.user.avatar, 
              role: d.user.role 
            },
            category: d.category || 'general',
            course: d.course?.title || 'Global Community',
            replies: d.replies?.length || 0,
            likes: d.likes || 0,
            views: d.views || 0,
            lastActivity: 'Recent', // Or format d.updatedAt
            isPinned: d.isPinned || false,
            isResolved: d.isResolved || false,
            tags: d.tags || [],
          }));
          setDiscussions(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch discussions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'css', label: 'CSS' },
    { value: 'react', label: 'React' },
    { value: 'redux', label: 'Redux' },
    { value: 'design', label: 'Design' },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'unresolved', label: 'Unresolved' },
    { value: 'pinned', label: 'Pinned' },
  ];

  const filteredDiscussions = useMemo(() => {
    return discussions.filter((discussion) => {
      const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           discussion.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [discussions, searchTerm, selectedCategory]);

  const sortedDiscussions = useMemo(() => {
    const sorted = [...filteredDiscussions];
    
    switch (selectedSort) {
      case 'popular':
        return sorted.sort((a, b) => b.likes - a.likes);
      case 'unresolved':
        return sorted.filter(d => !d.isResolved);
      case 'pinned':
        return sorted.filter(d => d.isPinned);
      case 'recent':
      default:
        return sorted;
    }
  }, [filteredDiscussions, selectedSort]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      css: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      react: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      redux: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      design: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    };
    return colors[category] || 'bg-white/5 text-gray-400 border border-white/10';
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group min-h-[300px] flex items-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-24 -mt-24" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 w-full">
            <div className="space-y-6 text-center md:text-left flex-1">
              <div className="inline-flex items-center space-x-3 bg-indigo-600/10 backdrop-blur-3xl border border-indigo-500/20 px-6 py-2 rounded-full">
                <FiMessageSquare className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-bold tracking-widest uppercase text-indigo-300">Collaborative Learning</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none text-white">
                Community <span className="text-indigo-500">Hub</span>
              </h1>
              <p className="text-lg text-gray-400 font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
                Connect with fellow learners, share knowledge, and solve problems together.
              </p>
            </div>

            <Button 
               onClick={() => router.push('/student/start-discussion')}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-2xl transition-all"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white tracking-tight">{discussions.length}</div>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">TOTAL DISCUSSIONS</div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {discussions.filter(d => d.isResolved).length}
            </div>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">RESOLVED</div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-indigo-400 tracking-tight">
              {discussions.reduce((sum, d) => sum + d.replies, 0)}
            </div>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">TOTAL REPLIES</div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-purple-400 tracking-tight">
              {discussions.reduce((sum, d) => sum + d.likes, 0)}
            </div>
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">TOTAL LIKES</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-950/50 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/5 py-4 px-14 rounded-xl text-sm font-medium text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="md:w-48">
              <Select
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black/40 border-white/5 text-white"
              />
            </div>
            <div className="md:w-48">
              <Select
                options={sortOptions}
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-black/40 border-white/5 text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Discussion Threads */}
        {sortedDiscussions.length > 0 ? (
          <div className="space-y-6">
            {sortedDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                onClick={() => router.push(`/student/discussion/${discussion.id}`)}
                className="group relative bg-gray-950 rounded-2xl p-8 border border-white/5 shadow-xl hover:shadow-2xl hover:border-indigo-500/20 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px]" />
                
                {/* Thread Body */}
                <div className="flex items-start justify-between gap-8 mb-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {discussion.isPinned && (
                        <span className="bg-rose-500/10 text-rose-400 text-[8px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-rose-500/20">
                          📌 Pinned
                        </span>
                      )}
                      {discussion.isResolved && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-500/20">
                          ✓ Resolved
                        </span>
                      )}
                      <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-indigo-500/20">
                        {discussion.category}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-tight">
                      {discussion.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span>By {discussion.author.name}</span>
                      <span className="text-white/10">|</span>
                      <span>{discussion.course}</span>
                      <span className="text-white/10">|</span>
                      <span className="flex items-center">
                        <FiClock className="h-3 w-3 mr-1.5" />
                        {discussion.lastActivity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thread Footer */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-10">
                    <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <FiMessageSquare className="h-4 w-4 mr-2 text-indigo-400" />
                      {discussion.replies} Replies
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <FiThumbsUp className="h-4 w-4 mr-2 text-emerald-400" />
                      {discussion.likes} Likes
                    </div>
                    <div className="hidden md:flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                       <FiSearch className="h-4 w-4 mr-2 text-amber-400" />
                      {discussion.views} Views
                    </div>
                  </div>
                  
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg transition-all active:scale-95">
                    View Discussion
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-950 rounded-2xl border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <FiMessageSquare className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">No discussions found</h3>
            <p className="text-gray-500 mb-6 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">
              <FiPlus className="h-4 w-4 mr-2" />
              Start Discussion
            </Button>
          </div>
        )}
          </div>
          
          {/* Sidebar Area: Community Rules */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group sticky top-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[30px] group-hover:bg-indigo-500/20 transition-all duration-700" />
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 relative z-10">Community Rules</h3>
              <ul className="text-[10px] font-bold text-indigo-200/60 space-y-3 relative z-10 uppercase tracking-wider">
                <li className="flex items-start"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 mr-3 flex-shrink-0" /> Be respectful & constructive</li>
                <li className="flex items-start"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 mr-3 flex-shrink-0" /> Search before posting</li>
                <li className="flex items-start"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 mr-3 flex-shrink-0" /> Provide plenty of context</li>
                <li className="flex items-start"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 mr-3 flex-shrink-0" /> Format your code blocks</li>
                <li className="flex items-start"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 mr-3 flex-shrink-0" /> Mark best answers</li>
              </ul>
              
              <div className="mt-8 pt-6 border-t border-indigo-500/20">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Pro Tips</h3>
                <p className="text-[10px] font-bold text-emerald-200/60 leading-relaxed uppercase tracking-wider">
                  Clear titles and detailed reproducible examples drastically increase your chances of getting a helpful response quickly!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

StudentDiscussionsPage.allowedRoles = ['student', 'instructor', 'admin'];
export default StudentDiscussionsPage;

