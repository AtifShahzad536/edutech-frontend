import React, { useState, useMemo } from 'react';
import { FiSearch, FiFilter, FiDownload, FiDollarSign, FiTrendingUp, FiUsers, FiCreditCard, FiArrowUp, FiArrowDown, FiCheck, FiX } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { AuthenticatedPage } from '@/types';

const AdminPaymentsPage: AuthenticatedPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const periodOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const stats = {
    totalRevenue: 2847563,
    totalTransactions: 15680,
    averageOrderValue: 181.47,
    refundRate: 2.3,
    growth: 15.2
  };

  const transactions = useMemo(() => [
    {
      id: 'txn_1234567890',
      date: '2024-03-10T14:30:00',
      customer: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      course: 'Complete Web Development Bootcamp',
      amount: 89.99,
      status: 'completed',
      paymentMethod: 'Visa ending in 4242',
      instructor: 'John Doe',
      instructorPayout: 72.00
    },
    {
      id: 'txn_1234567891',
      date: '2024-03-10T12:15:00',
      customer: 'Michael Chen',
      email: 'michael.c@example.com',
      course: 'Advanced React Patterns',
      amount: 129.99,
      status: 'completed',
      paymentMethod: 'Mastercard ending in 8888',
      instructor: 'Jane Smith',
      instructorPayout: 104.00
    },
    {
      id: 'txn_1234567892',
      date: '2024-03-10T10:45:00',
      customer: 'Emily Davis',
      email: 'emily.d@example.com',
      course: 'UI/UX Design Fundamentals',
      amount: 79.99,
      status: 'completed',
      paymentMethod: 'PayPal',
      instructor: 'Mike Johnson',
      instructorPayout: 64.00
    },
    {
      id: 'txn_1234567893',
      date: '2024-03-09T16:20:00',
      customer: 'Alex Kumar',
      email: 'alex.k@example.com',
      course: 'Complete Web Development Bootcamp',
      amount: 89.99,
      status: 'refunded',
      paymentMethod: 'Visa ending in 1234',
      instructor: 'John Doe',
      instructorPayout: 0
    },
    {
      id: 'txn_1234567894',
      date: '2024-03-09T09:30:00',
      customer: 'Lisa Wang',
      email: 'lisa.w@example.com',
      course: 'JavaScript Mastery',
      amount: 99.99,
      status: 'pending',
      paymentMethod: 'Visa ending in 5678',
      instructor: 'David Lee',
      instructorPayout: 0
    }
  ], []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch = txn.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           txn.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           txn.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           txn.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || txn.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, selectedStatus]);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    setShowToast({ message: 'Transaction report exported as CSV', type: 'success' });
    setTimeout(() => setShowToast(null), 3000);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      refunded: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] -mr-40 -mt-40 transition-all duration-1000 group-hover:bg-cyan-600/20" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-3 bg-cyan-500/10 border border-cyan-500/20 px-5 py-2 rounded-full">
                <FiDollarSign className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-cyan-400">Financial Ledger</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                Revenue <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">& Payments</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto xl:mx-0 leading-relaxed">
                Monitor global transactions, track payouts, and manage refunds. Your centralized hub for platform-wide financial liquidity.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-48">
                  <Select
                    options={periodOptions}
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center border border-white/10 active:scale-95 transition-all text-sm disabled:opacity-50"
                >
                  <FiDownload className="mr-3 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: FiDollarSign, color: 'emerald', trend: `+${stats.growth}%` },
            { label: 'Transactions', value: stats.totalTransactions.toLocaleString(), icon: FiCreditCard, color: 'blue', trend: '+8.5%' },
            { label: 'Avg Order Value', value: formatCurrency(stats.averageOrderValue), icon: FiTrendingUp, color: 'purple', trend: '+3.2%' },
            { label: 'Refund Rate', value: `${stats.refundRate}%`, icon: FiUsers, color: 'rose', trend: '-0.5%' },
          ].map((stat, i) => (
            <div key={i} className="group bg-white/5 rounded-2xl p-8 border border-white/5 shadow-2xl hover:bg-white/10 transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-${stat.color}-600/10 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'} uppercase tracking-widest`}>{stat.trend}</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-950/50 rounded-3xl border border-white/5 p-8 shadow-2xl">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="relative w-full max-w-xl">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Search transactions, customers, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-600"
              />
            </div>
            <div className="flex items-center gap-4 w-full xl:w-auto">
               <div className="flex-1 xl:w-56">
                  <Select
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-950 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Transaction ID</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Date</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Customer</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Amount</th>
                  <th className="px-10 py-8 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="group/row hover:bg-white/[0.02] transition-colors">
                      <td className="px-10 py-8">
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{txn.id}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-base font-black text-white tracking-tight leading-none">{formatDate(txn.date)}</div>
                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none">{txn.paymentMethod}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-base font-black text-white tracking-tight leading-none group-hover/row:text-indigo-400 transition-colors uppercase italic">{txn.customer}</div>
                        <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-2 leading-none">{txn.email}</div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-2xl font-black text-white tracking-tighter leading-none">{formatCurrency(txn.amount)}</div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <FiCreditCard className="h-12 w-12 text-gray-800" />
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">No transactions matched your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

AdminPaymentsPage.allowedRoles = ['admin'];
export default AdminPaymentsPage;
