import React, { useState, useMemo } from 'react';
import { FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiBook, FiDollarSign, FiBarChart, FiCheck, FiX, FiActivity, FiPieChart } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { ChartLine, ChartBar, ChartPie, ChartArea } from '@/components/ui/Charts';
import { AuthenticatedPage } from '@/types';

const AdminReportsPage: AuthenticatedPage = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const reportTypes = [
    { value: 'overview', label: 'Platform Overview' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'users', label: 'User Analytics' },
    { value: 'courses', label: 'Course Performance' },
    { value: 'engagement', label: 'Engagement Metrics' }
  ];

  const periodOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' }
  ];

  const overviewStats = {
    totalUsers: 45680,
    newUsers: 1240,
    activeUsers: 28450,
    totalCourses: 156,
    publishedCourses: 142,
    totalRevenue: 2847563,
    revenueGrowth: 15.2,
    avgCompletionRate: 68.5,
    avgSessionDuration: '12m 34s'
  };

  const topCourses = [
    { name: 'Complete Web Development Bootcamp', students: 15420, revenue: 1387485, rating: 4.8 },
    { name: 'UI/UX Design Fundamentals', students: 8934, revenue: 714631, rating: 4.6 },
    { name: 'Advanced React Patterns', students: 3421, revenue: 444693, rating: 4.7 },
    { name: 'JavaScript Mastery', students: 5234, revenue: 523366, rating: 4.5 }
  ];

  const topInstructors = [
    { name: 'John Doe', courses: 8, students: 28450, revenue: 2560983, rating: 4.8 },
    { name: 'Jane Smith', courses: 5, students: 12340, revenue: 1604231, rating: 4.7 },
    { name: 'Mike Johnson', courses: 6, students: 9876, revenue: 789876, rating: 4.6 }
  ];

  // Chart data
  const revenueData = [
    { month: 'Jan', revenue: 420000, target: 380000 },
    { month: 'Feb', revenue: 450000, target: 400000 },
    { month: 'Mar', revenue: 480000, target: 420000 },
    { month: 'Apr', revenue: 520000, target: 450000 },
    { month: 'May', revenue: 580000, target: 480000 },
    { month: 'Jun', revenue: 620000, target: 510000 },
  ];

  const userGrowthData = [
    { month: 'Jan', users: 32000 },
    { month: 'Feb', users: 34500 },
    { month: 'Mar', users: 37500 },
    { month: 'Apr', users: 40500 },
    { month: 'May', users: 43500 },
    { month: 'Jun', users: 45680 },
  ];

  const courseCategoryData = [
    { name: 'Development', value: 42 },
    { name: 'Design', value: 28 },
    { name: 'Business', value: 18 },
    { name: 'Marketing', value: 12 },
  ];

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setShowToast({ message: 'Analytical PDF report generated successfully', type: 'success' });
    setTimeout(() => setShowToast(null), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-24">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px] -mr-60 -mt-60 transition-all duration-1000 group-hover:bg-indigo-600/20" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-full mb-2">
                <FiBarChart className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">Intelligence Unit</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                Analytical <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Intelligence</span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto xl:mx-0 leading-relaxed">
                Unlock deep insights into platform growth, student engagement, and financial performance. Data-driven decisions for institutional excellence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
              <div className="w-48">
                <Select
                  options={reportTypes}
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                />
              </div>
              <div className="w-44">
                <Select
                  options={periodOptions}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
              </div>
              <button 
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center border-0 active:scale-95 transition-all text-sm disabled:opacity-50"
              >
                <FiDownload className="mr-3 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Report PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: overviewStats.totalUsers.toLocaleString(), icon: FiUsers, color: 'blue', detail: `+${overviewStats.newUsers.toLocaleString()} New` },
            { label: 'Active Users', value: overviewStats.activeUsers.toLocaleString(), icon: FiTrendingUp, color: 'emerald', detail: '62% Active Rate' },
            { label: 'Course Catalog', value: overviewStats.totalCourses, icon: FiBook, color: 'purple', detail: `${overviewStats.publishedCourses} Published` },
            { label: 'Gross Revenue', value: formatCurrency(overviewStats.totalRevenue), icon: FiDollarSign, color: 'yellow', detail: `+${overviewStats.revenueGrowth}% Growth` },
          ].map((stat, i) => (
            <div key={i} className="group bg-white/5 rounded-2xl p-8 border border-white/5 shadow-2xl hover:bg-white/10 transition-all hover:-translate-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-${stat.color}-600/10 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{stat.detail}</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">User Acquisition</h3>
              <FiTrendingUp className="text-indigo-400 h-5 w-5" />
            </div>
            <div className="h-64 rounded-2xl overflow-hidden p-4 bg-black/20 border border-white/5">
              <ChartLine 
                data={userGrowthData} 
                xKey="month" 
                yKey="users" 
                color="#818cf8"
              />
            </div>
          </div>

          <div className="bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Revenue Trends</h3>
              <FiDollarSign className="text-emerald-400 h-5 w-5" />
            </div>
            <div className="h-64 rounded-2xl overflow-hidden p-4 bg-black/20 border border-white/5">
              <ChartArea 
                data={revenueData} 
                xKey="month" 
                yKey="revenue" 
                color="#10b981"
              />
            </div>
          </div>
        </div>

        {/* Category & Top Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight text-center w-full">Categories</h3>
            </div>
            <div className="h-64 flex items-center justify-center p-4">
              <ChartPie 
                data={courseCategoryData} 
                nameKey="name" 
                valueKey="value"
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Course Revenue Metrics</h3>
            <div className="h-64 rounded-2xl overflow-hidden p-4 bg-black/20 border border-white/5">
              <ChartBar 
                data={topCourses} 
                xKey="name" 
                yKey="revenue" 
                color="#6366f1"
              />
            </div>
          </div>
        </div>

        {/* Engagement Summary */}
        <div className="bg-gray-950 rounded-3xl border border-white/5 p-12 shadow-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center md:text-left space-y-4">
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">Active Engagement</h3>
              <p className="text-gray-400 font-medium max-w-xl">
                Current platform retention is exceeding benchmarks by 12%. Average session time has increased by 15% since the last update.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              {[
                { label: 'Completion', value: overviewStats.avgCompletionRate + '%', color: 'indigo' },
                { label: 'Session', value: '12.5m', color: 'emerald' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-2xl text-center min-w-[160px] group-hover:bg-white/10 transition-all">
                  <div className={`text-3xl font-black text-${m.color}-400 mb-2`}>{m.value}</div>
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{m.label}</div>
                </div>
              ))}
            </div>
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

AdminReportsPage.allowedRoles = ['admin'];
export default AdminReportsPage;
