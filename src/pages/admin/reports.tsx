import React, { useState, useEffect, useMemo } from 'react';
import { FiDownload, FiTrendingUp, FiUsers, FiBook, FiDollarSign, FiBarChart2, FiCheck, FiX, FiActivity, FiAward, FiLayers } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Select from '@/components/ui/Select';
import { ChartLine, ChartBar, ChartPie, ChartArea } from '@/components/ui/Charts';
import { AuthenticatedPage } from '@/types';
import API_URL from '@/config/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminReportsPage: AuthenticatedPage = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [platformStats, setPlatformStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reportTypes = [
    { value: 'overview', label: 'Platform Overview' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'users', label: 'User Analytics' },
    { value: 'courses', label: 'Course Performance' },
  ];

  const periodOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
  ];

  const fetchAll = async () => {
    try {
      const t = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${t}` };

      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/analytics`, { headers }),
      ]);

      const [statsData, analyticsData] = await Promise.all([
        statsRes.json(),
        analyticsRes.json(),
      ]);

      if (statsData.success && statsData.data?.stats) setPlatformStats(statsData.data.stats);
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getPeriodCount = (period: string) => {
    switch(period) {
      case '7days': return 1; // Since backend returns monthly data, 1 month is the smallest unit
      case '30days': return 1;
      case '90days': return 3;
      case '1year': return 12;
      default: return 12;
    }
  };

  const periodCount = getPeriodCount(selectedPeriod);

  const userGrowthData = useMemo(() => {
    const data = analytics?.userGrowth || [];
    return data.slice(Math.max(data.length - periodCount, 0));
  }, [analytics, periodCount]);

  const revenueData = useMemo(() => {
    const data = analytics?.revenueTrends || [];
    return data.slice(Math.max(data.length - periodCount, 0));
  }, [analytics, periodCount]);

  const topCourses = useMemo(() => analytics?.topCourses || [], [analytics]);
  const topInstructors = useMemo(() => analytics?.topInstructors || [], [analytics]);
  const categoryBreakdown = useMemo(() => analytics?.categoryBreakdown || [], [analytics]);
  const enrollmentStats = useMemo(() => analytics?.enrollmentStats || {}, [analytics]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`EduTech Report - ${reportTypes.find(r => r.value === selectedReport)?.label}`, 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Period: ${periodOptions.find(p => p.value === selectedPeriod)?.label}`, 14, 30);
      
      let yOffset = 40;

      if (selectedReport === 'overview' || selectedReport === 'users') {
        doc.setFontSize(16);
        doc.text('Platform Statistics', 14, yOffset);
        autoTable(doc, {
          startY: yOffset + 5,
          head: [['Metric', 'Value']],
          body: [
            ['Total Users', platformStats?.totalUsers?.toLocaleString() || '0'],
            ['Total Students', platformStats?.students?.toLocaleString() || '0'],
            ['Instructors', platformStats?.instructors?.toLocaleString() || '0'],
            ['Published Courses', platformStats?.totalCourses?.toLocaleString() || '0'],
            ['Growth Rate', platformStats?.growthRate || '0%'],
          ],
        });
        yOffset = (doc as any).lastAutoTable.finalY + 15;
      }

      if (selectedReport === 'overview' || selectedReport === 'revenue') {
        doc.setFontSize(16);
        doc.text('Financial Overview', 14, yOffset);
        autoTable(doc, {
          startY: yOffset + 5,
          head: [['Metric', 'Amount']],
          body: [
            ['Gross Revenue', formatCurrency(platformStats?.totalRevenue || 0)],
            ['Average Order Value', formatCurrency(platformStats?.avgOrderValue || 0)],
            ['Total Transactions', platformStats?.totalTransactions?.toLocaleString() || '0'],
          ],
        });
        yOffset = (doc as any).lastAutoTable.finalY + 15;
      }

      if (selectedReport === 'overview' || selectedReport === 'courses') {
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }
        doc.setFontSize(16);
        doc.text('Top Courses Performance', 14, yOffset);
        autoTable(doc, {
          startY: yOffset + 5,
          head: [['Course', 'Category', 'Students', 'Revenue', 'Rating']],
          body: topCourses.map((c: any) => [
            c.name, c.category, c.students.toLocaleString(), formatCurrency(c.revenue), c.rating || '—'
          ]),
        });
        yOffset = (doc as any).lastAutoTable.finalY + 15;
      }

      doc.save(`edutech_${selectedReport}_report.pdf`);
      setShowToast({ message: 'Analytical PDF report generated successfully', type: 'success' });
    } catch (error) {
      console.error('PDF Generation failed', error);
      setShowToast({ message: 'Failed to generate PDF', type: 'error' });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-24">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px] -mr-60 -mt-60" />
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6 text-center xl:text-left">
              <div className="inline-flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 rounded-full">
                <FiBarChart2 className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">Intelligence Unit</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                Analytical <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Intelligence</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 font-medium max-w-2xl mx-auto xl:mx-0">
                Unlock deep insights into platform growth, student engagement, and financial performance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/5 backdrop-blur-xl">
              <div className="w-48">
                <Select options={reportTypes} value={selectedReport} onChange={e => setSelectedReport(e.target.value)} />
              </div>
              <div className="w-44">
                <Select options={periodOptions} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} />
              </div>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center active:scale-95 transition-all disabled:opacity-50"
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
            { label: 'Total Users', value: (platformStats?.totalUsers || 0).toLocaleString(), sub: `${platformStats?.students || 0} Students`, icon: FiUsers, color: 'blue' },
            { label: 'Platform Growth', value: platformStats?.growthRate || '0%', sub: 'Month over Month', icon: FiTrendingUp, color: 'emerald' },
            { label: 'Course Catalog', value: (platformStats?.totalCourses || 0).toString(), sub: 'Total Published', icon: FiBook, color: 'purple' },
            { label: 'Gross Revenue', value: formatCurrency(platformStats?.totalRevenue || 0), sub: `${enrollmentStats.totalEnrollments || 0} Enrollments`, icon: FiDollarSign, color: 'yellow' },
          ].map((s, i) => (
            <div key={i} className="group bg-white/5 rounded-2xl p-8 border border-white/5 shadow-2xl hover:bg-white/10 transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-${s.color}-600/10 border border-${s.color}-500/20 group-hover:scale-110 transition-transform`}>
                  <s.icon className={`h-6 w-6 text-${s.color}-400`} />
                </div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{s.sub}</span>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
              {isLoading ? (
                <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">User Acquisition</h3>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">New registrations over time</p>
              </div>
              <FiTrendingUp className="text-indigo-400 h-5 w-5" />
            </div>
            <div className="h-64 rounded-2xl overflow-hidden p-4 bg-black/20 border border-white/5">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest animate-pulse">Loading chart...</div>
                </div>
              ) : (
                <ChartLine data={userGrowthData} xKey="month" yKey="users" color="#818cf8" />
              )}
            </div>
          </div>

          <div className="bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Revenue Trends</h3>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Platform earnings over time</p>
              </div>
              <FiDollarSign className="text-emerald-400 h-5 w-5" />
            </div>
            <div className="h-64 rounded-2xl overflow-hidden p-4 bg-black/20 border border-white/5">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest animate-pulse">Loading chart...</div>
                </div>
              ) : (
                <ChartArea data={revenueData} xKey="month" yKey="revenue" color="#10b981" />
              )}
            </div>
          </div>
        </div>

        {/* Category + Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tight text-center mb-8">Course Categories</h3>
            {categoryBreakdown.length > 0 ? (
              <>
                <div className="h-48 flex items-center justify-center">
                  <ChartPie data={categoryBreakdown} nameKey="name" valueKey="value" />
                </div>
                <div className="mt-6 space-y-3">
                  {categoryBreakdown.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{c.name}</span>
                      <span className="text-[10px] font-black text-white">{c.value} course{c.value !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <FiLayers className="h-10 w-10 text-gray-800 mb-4" />
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">No categories yet</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-gray-950 rounded-3xl border border-white/5 p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Top Courses by Enrollment</h3>
            {topCourses.length > 0 ? (
              <div className="h-64 rounded-2xl overflow-hidden p-4 bg-black/20 border border-white/5">
                <ChartBar data={topCourses} xKey="name" yKey="students" color="#6366f1" />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/20 rounded-2xl border border-white/5">
                <FiBook className="h-10 w-10 text-gray-800 mb-4" />
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">No enrollment data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Courses Table */}
        <div className="bg-gray-950 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Course Performance Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  {['Course', 'Category', 'Students', 'Revenue', 'Rating'].map(h => (
                    <th key={h} className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topCourses.length > 0 ? topCourses.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-white uppercase tracking-tight text-sm group-hover:text-indigo-400 transition-colors">{c.name}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-lg">{c.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <FiUsers className="h-3 w-3 text-gray-600" />
                        <span className="text-sm font-black text-white">{c.students.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-emerald-400">{formatCurrency(c.revenue)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-1">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-sm font-black text-white">{c.rating || '—'}</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">No course data available</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Instructors Table */}
        <div className="bg-gray-950 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Top Instructors</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  {['Instructor', 'Courses', 'Total Students', 'Avg Rating'].map(h => (
                    <th key={h} className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topInstructors.length > 0 ? topInstructors.map((inst: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-xs font-black text-indigo-400">{inst.name?.[0] || 'I'}</span>
                        </div>
                        <span className="font-black text-white uppercase tracking-tight text-sm group-hover:text-indigo-400 transition-colors">{inst.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6"><span className="text-sm font-black text-white">{inst.courses}</span></td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <FiUsers className="h-3 w-3 text-gray-600" />
                        <span className="text-sm font-black text-white">{inst.students.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-1">
                        <span className="text-amber-400">★</span>
                        <span className="text-sm font-black text-white">{inst.rating || '—'}</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">No instructor data available</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engagement Summary */}
        <div className="bg-gray-950 rounded-3xl border border-white/5 p-12 shadow-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center md:text-left space-y-4">
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">Engagement Summary</h3>
              <p className="text-gray-400 font-medium max-w-xl">
                Platform-wide retention and learning statistics based on real enrollment and completion data.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
              {[
                { label: 'Avg Completion', value: `${platformStats?.avgCompletionRate || 0}%`, color: 'indigo' },
                { label: 'Total Enrollments', value: (enrollmentStats.totalEnrollments || 0).toLocaleString(), color: 'emerald' },
                { label: 'Instructors', value: (platformStats?.instructors || 0).toString(), color: 'purple' },
              ].map((m, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-2xl text-center min-w-[120px] group-hover:bg-white/10 transition-all">
                  <div className={`text-3xl font-black text-${m.color}-400 mb-2`}>{m.value}</div>
                  <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-8 duration-500">
          <div className={`px-10 py-5 rounded-2xl flex items-center shadow-2xl backdrop-blur-3xl border ${
            showToast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${showToast.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
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
