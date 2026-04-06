import React, { useState, useMemo, FormEvent } from 'react';
import { FiMessageSquare, FiTag, FiBook, FiArrowLeft, FiSend, FiX } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useRouter } from 'next/router';
import { AuthenticatedPage } from '@/types';

const StartDiscussionPage: AuthenticatedPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const courses = useMemo(() => [
    { value: '', label: 'Select a course (optional)' },
    { value: 'course1', label: 'Complete Web Development Bootcamp' },
    { value: 'course2', label: 'Advanced React Patterns' },
    { value: 'course3', label: 'UI/UX Design Fundamentals' },
    { value: 'course4', label: 'JavaScript Mastery' },
  ], []);

  const categories = useMemo(() => [
    { value: '', label: 'Select a category' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'css', label: 'CSS & Styling' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'database', label: 'Database' },
    { value: 'general', label: 'General Discussion' },
    { value: 'help', label: 'Help & Support' },
    { value: 'showcase', label: 'Project Showcase' },
  ], []);

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validation
    if (!title.trim() || !content.trim() || !selectedCategory) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Submitting discussion...', { title, content, selectedCategory, selectedCourse, tags });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Discussion created successfully');
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Failed to create discussion:', error);
      alert('Failed to create discussion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMessageSquare className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Discussion Created!</h1>
            <p className="text-gray-600 mb-6">
              Your discussion has been posted successfully. The community can now view and respond to your post.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Your Discussion</h3>
              <p className="font-medium text-gray-900">{title}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/student/discussions')}>
                View Discussions
              </Button>
              <Button variant="outline" onClick={() => {
                setSubmitSuccess(false);
                setTitle('');
                setContent('');
                setTags([]);
                setSelectedCourse('');
                setSelectedCategory('');
              }}>
                Start Another
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-1000">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-10 md:p-12 text-white border border-white/5 shadow-2xl mb-10 group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-600/20 transition-all duration-1000" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Start a <span className="text-indigo-400">Discussion</span></h1>
                <p className="text-sm text-gray-400 font-medium">Ask a question, share knowledge, or start a conversation</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/student/discussions')} className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl">
                <FiArrowLeft className="mr-2" />
                Back to Hub
              </Button>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="bg-gray-950 rounded-2xl border border-white/5 p-8 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Discussion Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How do I implement authentication in React?"
                required
                className="!bg-black/40 text-white border-white/10 focus:border-indigo-500/50 py-4 placeholder-gray-600 text-lg"
              />
              <p className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-widest">
                Be specific and concise. Good titles attract better responses.
              </p>
            </div>
          </div>

          {/* Category & Course */}
          <div className="bg-gray-950 rounded-2xl border border-white/5 p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Category <span className="text-rose-500">*</span>
                </label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-black/40 border-white/10 text-white py-4"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Related Course
                </label>
                <Select
                  options={courses}
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="bg-black/40 border-white/10 text-white py-4"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-950 rounded-2xl border border-white/5 p-8 shadow-xl">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question or topic in detail..."
              rows={10}
              required
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all font-medium custom-scrollbar"
            />
            <p className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-widest">
              Provide as much detail as possible. Include code snippets, error messages, or examples when relevant.
            </p>
          </div>

          {/* Tags */}
          <div className="bg-gray-950 rounded-2xl border border-white/5 p-8 shadow-xl">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center">
              <FiTag className="mr-2 h-3 w-3" />
              Tags (up to 5)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tags (press Enter)"
                className="flex-1 !bg-black/40 text-white border-white/10 focus:border-indigo-500/50 w-full"
              />
              <Button type="button" onClick={handleAddTag} disabled={!currentTag.trim() || tags.length >= 5} className="bg-white/5 hover:bg-white/10 border-white/10 whitespace-nowrap w-full sm:w-auto">
                Add Tag
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-xl"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-3 text-indigo-400/50 hover:text-rose-400 transition-colors"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-[10px] text-gray-500 mt-4 font-bold uppercase tracking-widest">
              Tags help others find your discussion. Use relevant keywords.
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] group-hover:bg-indigo-500/20 transition-all duration-700" />
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 relative z-10">Discussion Guidelines</h3>
            <ul className="text-sm font-medium text-indigo-200/60 space-y-2 relative z-10">
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" /> Be respectful and constructive in your posts</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" /> Search before posting to avoid duplicates</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" /> Provide enough context for others to help you</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" /> Format code properly using code blocks</li>
              <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3" /> Mark helpful responses as accepted answers</li>
            </ul>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 gap-6">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span className="text-rose-500">*</span> Required fields
            </p>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <Button variant="outline" href="/student/discussions" className="flex-1 sm:flex-none border-white/10 hover:bg-white/5">
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!title.trim() || !content.trim() || !selectedCategory || isSubmitting}
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] py-4 px-8 border-0 shadow-xl"
              >
                {isSubmitting ? 'Posting...' : <><FiSend className="mr-2 h-4 w-4" /> Post Discussion</>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

StartDiscussionPage.allowedRoles = ['student', 'instructor', 'admin'];
export default StartDiscussionPage;
