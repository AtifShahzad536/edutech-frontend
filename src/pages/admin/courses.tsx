import React, { useState, useMemo } from 'react';
import { FiSearch, FiFilter, FiCheck, FiX, FiEye, FiEdit, FiTrash2, FiMoreVertical, FiBook, FiUsers, FiStar, FiDollarSign, FiActivity, FiZap, FiLayers, FiShield, FiPlus } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { AuthenticatedPage } from '@/types';

interface AdminCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  status: 'published' | 'pending' | 'draft';
  students: number;
  rating: number;
  price: number;
  revenue: number;
  lastUpdate: string;
}

const AdminCoursesPage: AuthenticatedPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: 'Design',
    price: 0,
    status: 'published' as 'published' | 'pending' | 'draft',
    description: '',
  });

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const t = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await response.json();
        if (result.success) {
          const mapped = result.data.map((c: any) => ({
            id: c._id,
            title: c.title,
            instructor: c.instructor?.firstName ? `${c.instructor.firstName} ${c.instructor.lastName}` : 'Unknown',
            category: c.category || 'Development',
            status: c.isPublished ? 'published' : 'pending',
            students: c.studentsCount || 0,
            rating: c.rating || 0,
            price: c.price || 0,
            revenue: (c.price || 0) * (c.studentsCount || 0),
            lastUpdate: new Date(c.updatedAt).toISOString().split('T')[0]
          }));
          setCourses(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch admin courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedCourse(null);
    setFormData({
      title: '',
      instructor: '',
      category: 'Design',
      price: 0,
      status: 'pending',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (course: AdminCourse) => {
    setIsEditMode(true);
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      price: course.price,
      status: course.status,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      setShowToast({ message: 'Course deleted successfully', type: 'success' });
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsModalOpen(false);
    setShowToast({ 
      message: `Course ${isEditMode ? 'updated' : 'created'} successfully`, 
      type: 'success' 
    });
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Course Library Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[140px] -mr-60 -mt-60 transition-all duration-1000 group-hover:bg-purple-600/20" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-3 bg-purple-500/10 border border-purple-500/20 px-5 py-2 rounded-full mb-2">
                <FiLayers className="h-4 w-4 text-purple-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-purple-400">Manage Content</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                All <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">Courses</span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto xl:mx-0 leading-relaxed">
                Review, approve, and manage all educational content on the platform. Monitor course performance and instructor activity.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full xl:w-[350px]">
               <div className="group bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition-all hover:-translate-y-1 relative overflow-hidden active:scale-95 shadow-xl">
                  <div className="flex flex-col items-start space-y-4">
                    <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <FiUsers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-white tracking-tight leading-none">278.4K</div>
                      <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none">Total Active Students</div>
                    </div>
                  </div>
               </div>
               <div className="group bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition-all hover:-translate-y-1 relative overflow-hidden active:scale-95 shadow-xl">
                  <div className="flex flex-col items-start space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FiDollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-emerald-500 tracking-tight leading-none">$2.54M</div>
                      <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none">Gross Platform Revenue</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Course Controls */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="flex-1 relative group">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
              <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search by title or instructor..."
                 className="w-full bg-gray-950/50 border border-white/5 rounded-xl py-4 pl-14 pr-6 text-[12px] font-medium text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/30 transition-all shadow-inner"
              />
           </div>
           <div className="flex gap-4">
              <button 
                onClick={handleCreateNew}
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all outline-none border-0 flex items-center"
              >
                 <FiPlus className="mr-2 h-4 w-4" />
                 Create Course
              </button>
           </div>
        </div>

        {/* Course Library Table */}
        <div className="bg-gray-950/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Course Name</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Instructor</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Status</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Enrollment</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Revenue</th>
                  <th className="px-10 py-8 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="group/row hover:bg-white/[0.02] transition-colors relative">
                      <td className="px-10 py-8">
                        <div className="space-y-1 relative z-10">
                            <div className="text-lg font-black text-white uppercase tracking-tight group-hover/row:text-purple-400 transition-colors leading-none">{course.title}</div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">{course.category} • Version 1.2</div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-4 relative z-10">
                            <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group-hover/row:scale-110 transition-transform">
                              <span className="text-[10px] font-black text-purple-400">{course.instructor[0]}</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-white leading-none">{course.instructor}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            course.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            course.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                            {course.status}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-3 relative z-10">
                            <FiUsers className="h-4 w-4 text-gray-700" />
                            <span className="text-base font-black text-white tracking-tight leading-none">{course.students.toLocaleString()} Students</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-1 relative z-10">
                            <div className="text-lg font-black text-white tracking-tight leading-none group-hover/row:text-emerald-400 transition-colors">${(course.revenue / 1000).toFixed(1)}K</div>
                            <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Revenue Details</div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end space-x-3 opacity-0 group-hover/row:opacity-100 transition-all duration-300 relative z-10">
                            <button 
                              onClick={() => handleEdit(course)}
                              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 flex items-center justify-center font-bold"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(course.id)}
                              className="w-10 h-10 bg-white/5 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-500 transition-all border border-white/5 flex items-center justify-center font-bold"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <FiLayers className="h-12 w-12 text-gray-800" />
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">No courses match your filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Course Details' : 'Create New Course'}
        size="lg"
        variant="dark"
      >
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Course Title</label>
            <Input
              required
              placeholder="e.g. Advanced React Architecture"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instructor</label>
              <Input
                required
                placeholder="e.g. Jane Doe"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                options={[
                  { value: 'Development', label: 'Development' },
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Business', label: 'Business' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Price ($)</label>
              <Input
                required
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                options={[
                  { value: 'published', label: 'Published' },
                  { value: 'pending', label: 'Pending Approval' },
                  { value: 'draft', label: 'Draft' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
            <Textarea
              placeholder="Provide a brief overview of the course content..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="min-w-[140px]"
            >
              {isSaving ? 'Processing...' : isEditMode ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-8 duration-500">
          <div className={`px-10 py-5 rounded-2xl flex items-center shadow-2xl backdrop-blur-3xl border ${
            showToast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
              showToast.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
            }`}>
              {showToast.type === 'success' ? <FiCheck className="h-4 w-4" /> : <FiX className="h-4 w-4" />}
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">{showToast.message}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

AdminCoursesPage.allowedRoles = ['admin'];
export default AdminCoursesPage;
