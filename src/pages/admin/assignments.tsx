import React, { useState, useEffect } from 'react';
import { FiSearch, FiLayers, FiUsers, FiCheck, FiClock, FiArchive, FiBookOpen, FiCalendar, FiTrash2, FiEye } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthenticatedPage } from '@/types';
import API_URL from '@/config/api';

const AdminAssignmentsPage: AuthenticatedPage = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAssignments = async () => {
    try {
      const t = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/assignments`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setAssignments(result.data.assignments || []);
        setStats(result.data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const filtered = assignments.filter(a => {
    const matchSearch = (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (a.course?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-24">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] -mr-40 -mt-40" />
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-3 bg-amber-500/10 border border-amber-500/20 px-5 py-2 rounded-full">
                <FiLayers className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400">Platform Assignments</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                All <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">Assignments</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto xl:mx-0">
                Monitor all assignments across every course and instructor. Track completion rates and submission activity.
              </p>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
              {[
                { label: 'Total', value: stats?.total ?? 0, icon: FiLayers, color: 'amber' },
                { label: 'Active', value: stats?.active ?? 0, icon: FiCheck, color: 'emerald' },
                { label: 'Closed', value: stats?.closed ?? 0, icon: FiClock, color: 'blue' },
                { label: 'Archived', value: stats?.archived ?? 0, icon: FiArchive, color: 'gray' },
              ].map((s, i) => (
                <div key={i} className={`bg-black/40 border border-white/5 rounded-2xl p-5 text-center`}>
                  <div className={`text-2xl font-black text-${s.color}-400`}>{s.value}</div>
                  <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by title or course..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/5 py-4 pl-14 pr-6 rounded-xl text-[12px] font-medium text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-black/40 border border-white/5 py-4 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-amber-500/30 min-w-[200px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Assignments Table */}
        <div className="bg-gray-950/80 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  {['Assignment & Course', 'Instructor', 'Due Date', 'Points', 'Status'].map(h => (
                    <th key={h} className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-10 py-20 text-center">
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest animate-pulse">Loading assignments...</div>
                  </td></tr>
                ) : filtered.length > 0 ? filtered.map(a => (
                  <tr key={a._id} className="group/row hover:bg-white/[0.02] transition-colors">
                    <td className="px-10 py-8">
                      <div className="font-black text-white uppercase tracking-tight group-hover/row:text-amber-400 transition-colors leading-none">{a.title}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <FiBookOpen className="h-3 w-3 text-gray-600" />
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{a.course?.title || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-sm font-black text-white uppercase tracking-tight">
                        {a.instructor?.firstName} {a.instructor?.lastName}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-black text-white tracking-tight">
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No Date'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-base font-black text-amber-400">{a.totalPoints ?? 100} pts</div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor[a.status] || statusColor.archived}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-10 py-32 text-center">
                    <FiLayers className="h-12 w-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No assignments found.</p>
                    <p className="text-[9px] text-gray-700 mt-2">Assignments are created by instructors in their courses.</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

AdminAssignmentsPage.allowedRoles = ['admin'];
export default AdminAssignmentsPage;
