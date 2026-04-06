import React, { useState } from 'react';
import { FiSearch, FiFilter, FiUser, FiMail, FiCalendar, FiEdit, FiTrash2, FiEye, FiShield, FiUsers, FiZap, FiActivity, FiGlobe, FiRadio, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { AuthenticatedPage } from '@/types';
import API_URL from '@/config/api';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  coursesCount?: number;
  studentsCount?: number;
  revenue?: number;
  stability: number;
}

const AdminUsersPage: AuthenticatedPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student' as 'student' | 'instructor' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const t = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const result = await response.json();
        if (result.success) {
          const mapped = result.data.map((u: any) => ({
            id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            status: 'active', // Assuming active for simple sync
            createdAt: new Date(u.createdAt).toISOString().split('T')[0],
            lastLoginAt: u.updatedAt,
            stability: 100
          }));
          setUsers(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch admin users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setShowToast({ message: 'User deleted successfully', type: 'success' });
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
      message: `User ${isEditMode ? 'updated' : 'created'} successfully`, 
      type: 'success' 
    });
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* User Directory Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-indigo-600/20" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-full">
                <FiUsers className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">User Accounts</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                Manage <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Users</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto xl:mx-0 leading-relaxed">
                View and manage all students, instructors, and administrators. Update account details, change permissions, and monitor activity.
              </p>
            </div>

            <button 
              onClick={handleCreateNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center border-0 active:scale-95 transition-all"
            >
              <FiPlus className="mr-3 h-5 w-5" />
              Add New User
            </button>
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: '14,129', icon: FiUsers, color: 'indigo' },
            { label: 'Instructors', value: '128', icon: FiShield, color: 'purple' },
            { label: 'Courses', value: '842', icon: FiRadio, color: 'emerald' },
            { label: 'Platform Status', value: 'Active', icon: FiActivity, color: 'cyan' },
          ].map((stat, i) => (
            <div key={i} className="group bg-white/5 rounded-2xl p-8 border border-white/5 shadow-2xl hover:bg-white/10 transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 leading-none">{stat.label}</div>
              <div className="text-3xl font-black text-white tracking-tight leading-none">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Directory Search & Filters */}
        <div className="bg-gray-950/50 rounded-2xl p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/5 py-4 px-14 rounded-xl text-[12px] font-medium text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-indigo-500/30 transition-all cursor-pointer appearance-none min-w-[200px] hover:text-white"
              >
                <option value="all">All Roles</option>
                <option value="student">Students Only</option>
                <option value="instructor">Instructors Only</option>
                <option value="admin">Administrators</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-indigo-500/30 transition-all cursor-pointer appearance-none min-w-[200px] hover:text-white"
              >
                <option value="all">Any Status</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Data Table */}
        <div className="bg-gray-950/80 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">User</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Role</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Activity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Last Online</th>
                  <th className="px-10 py-8 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="group/row hover:bg-white/[0.02] transition-colors relative">
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-6 relative z-10">
                          <div className="w-14 h-14 bg-gray-900 rounded-2xl border border-white/5 flex items-center justify-center shadow-lg group-hover/row:scale-105 transition-transform">
                            <span className="text-xl font-black text-indigo-500">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-lg font-black text-white uppercase tracking-tight group-hover/row:text-indigo-400 transition-colors leading-none">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          user.role === 'admin' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : user.role === 'instructor' 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-4">
                           <div className="flex-1 h-1.5 w-32 bg-white/5 rounded-full overflow-hidden p-[1px]">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${user.status === 'suspended' ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`} 
                                style={{ width: `${user.stability}%` }} 
                              />
                           </div>
                           <span className="text-base font-black text-white tracking-tight leading-none">{user.stability}%</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-base font-black text-white tracking-tight leading-none">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Inactive'}</div>
                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none">Last Logged In</div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end space-x-3 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="w-10 h-10 bg-white/5 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-500 transition-all border border-white/5 flex items-center justify-center"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                    <tr>
                    <td colSpan={5} className="px-10 py-32 text-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent opacity-30" />
                       <div className="relative z-10">
                          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                            <FiUsers className="h-8 w-8 text-gray-700" />
                          </div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No Records Found</h3>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">No users match your current filter criteria.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit User Details' : 'Create New User'}
        size="lg"
        variant="dark"
      >
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">First Name</label>
              <Input
                required
                placeholder="e.g. John"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Last Name</label>
              <Input
                required
                placeholder="e.g. Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
            <Input
              required
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Role</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'instructor', label: 'Instructor' },
                  { value: 'admin', label: 'Administrator' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'suspended', label: 'Suspended' },
                ]}
              />
            </div>
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
              {isSaving ? 'Processing...' : isEditMode ? 'Update Account' : 'Create Account'}
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

AdminUsersPage.allowedRoles = ['admin'];
export default AdminUsersPage;
