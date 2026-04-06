import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  FiBookOpen, FiClock, FiAward, FiTrendingUp, FiPlay, FiCalendar,
  FiTarget, FiZap, FiStar, FiCheckCircle, FiActivity,
  FiUsers, FiCpu, FiLayers, FiArrowRight, FiBell, FiBarChart2
} from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/hooks/useRedux';
import { useAuthSync } from '@/hooks/useAuthSync';
import { ChartArea, ChartRadar, ChartComposed, ChartLine } from '@/components/ui/Charts';
import Link from 'next/link';
import { AuthenticatedPage } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const StudentDashboard: AuthenticatedPage = () => {
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);
  const router = useRouter();
  useAuthSync();

  const [loading, setLoading] = React.useState(true);
  const [dashboardStats, setDashboardStats] = React.useState<any>(null);
  const [activityData, setActivityData]     = React.useState<any[]>([]);
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [activeTasks, setActiveTasks]       = React.useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = React.useState<any[]>([]);
  const [quizData, setQuizData]             = React.useState<any[]>([]);
  const [skillData, setSkillData]           = React.useState<any[]>([]);

  useEffect(() => {
    if (!isInitialized || !token) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDashboardStats(data.stats);
          setActivityData(data.activityStats || []);
          setRecentActivity(data.stats.recentActivity || []);
          setActiveTasks(data.activeAssignments || []);
          setEnrolledCourses(data.enrolledCourses || []);
          setQuizData(data.quizData || []);
          setSkillData(data.skillData || []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isInitialized, token]);

  const statCards = useMemo(() => [
    {
      label: 'Learning Streak',
      value: dashboardStats?.learningStreak || '0 Days',
      icon: FiZap,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20'
    },
    {
      label: 'Course Progress',
      value: dashboardStats?.courseProgress || '0%',
      icon: FiActivity,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/20'
    },
    {
      label: 'Enrolled Courses',
      value: (dashboardStats?.activeCourses || 0).toString(),
      icon: FiLayers,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20'
    },
    {
      label: 'Total Points',
      value: (dashboardStats?.totalPoints || 0).toLocaleString(),
      icon: FiCpu,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20'
    },
  ], [dashboardStats]);

  // ─── Progress overview for header card ──────────────────────────────────────
  const topCourses = enrolledCourses.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="pb-20 md:pb-32 space-y-8 md:space-y-12 animate-in fade-in duration-700">

        {/* ── HERO HEADER ─────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-8 md:p-12 text-white border border-white/5 shadow-2xl group min-h-[280px] flex items-center">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 transition-all duration-[5s] group-hover:bg-indigo-600/20 pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10 w-full">
            {/* Left */}
            <div className="flex-1 space-y-5 text-center xl:text-left">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">System Online</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                {user?.firstName || 'Student'}&apos;s <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Dashboard</span>
              </h1>

              <p className="text-sm text-gray-400 max-w-md font-medium leading-relaxed">
                {enrolledCourses.length > 0
                  ? `You have ${activeTasks.length} pending task${activeTasks.length !== 1 ? 's' : ''} and ${enrolledCourses.length} active course${enrolledCourses.length !== 1 ? 's' : ''}. Keep it up!`
                  : `Welcome back! Explore courses to start your learning journey.`}
              </p>

              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
                <Link href="/student/courses">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-xl active:scale-95 flex items-center gap-2">
                    <FiPlay className="h-4 w-4" />
                    Resume Learning
                  </button>
                </Link>
                <Link href="/student/assignments">
                  <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-7 py-3.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-2">
                    <FiCalendar className="h-4 w-4" />
                    View Tasks
                    {activeTasks.length > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                        {activeTasks.length > 9 ? '9+' : activeTasks.length}
                      </span>
                    )}
                  </button>
                </Link>
              </div>
            </div>

            {/* Right — Course Progress Overview */}
            <div className="w-full xl:w-[360px] shrink-0">
              <div className="bg-white/5 backdrop-blur border border-white/8 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Course Progress</h3>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{enrolledCourses.length} enrolled</span>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                 ) : topCourses.length > 0 ? (
                  <div className="space-y-4">
                    {topCourses.map((course: any) => (
                      <div 
                        key={course.id} 
                        onClick={() => router.push(`/student/learning/${course.id}`)}
                        className="group/c cursor-pointer"
                      >
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-bold text-white tracking-tight truncate max-w-[200px] group-hover/c:text-indigo-400 transition-colors">{course.title}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0 ml-2">{course.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center opacity-30">
                    <FiBookOpen className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No courses yet</p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                    {dashboardStats?.learningStreak} active streak
                  </span>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Achiever</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, idx) => (
            <div 
              key={idx} 
              onClick={() => router.push(stat.label === 'Total Points' ? '/student/profile' : '/student/my-courses')}
              className={`group bg-gray-950 border ${stat.border} rounded-2xl p-5 md:p-7 hover:bg-white/5 transition-all cursor-pointer shadow-lg relative overflow-hidden`}
            >
              <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                <div className={`p-3 rounded-xl ${stat.bg} transition-all group-hover:scale-110 duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  {loading
                    ? <Skeleton className="h-8 w-16 mx-auto mb-1" />
                    : <div className={`text-2xl md:text-3xl font-black tracking-tight leading-none mb-1 ${stat.color}`}>{stat.value}</div>
                  }
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Engagement Chart */}
          <div className="bg-gray-950 border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <FiActivity className="text-indigo-400 h-4 w-4" />
                    </div>
                    Engagement Overview
                  </h2>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Study intensity · 7-day view</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-widest">
                  This week
                </div>
              </div>
              <div className="h-56">
                {loading
                  ? <Skeleton className="h-56" />
                  : <ChartArea data={activityData} xKey="name" yKey="hours" color="#6366f1" />
                }
              </div>
            </div>
          </div>

          {/* Skill Radar */}
          <div className="bg-gray-950 border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <FiTrendingUp className="text-cyan-400 h-4 w-4" />
                    </div>
                    Skill Distribution
                  </h2>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Based on enrolled course categories</p>
                </div>
              </div>
              <div className="h-56 flex items-center justify-center">
                {loading
                  ? <Skeleton className="h-56 w-full" />
                  : <ChartRadar data={skillData} xKey="subject" yKey="A" color="#06b6d4" />
                }
              </div>
            </div>
          </div>
        </div>

        {/* ── MINI CHARTS ROW ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Performance */}
          <div className="bg-gray-950 border border-white/5 rounded-2xl p-6 shadow-lg group min-h-[240px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quiz Performance</h3>
              <FiZap className="text-amber-400 h-4 w-4" />
            </div>
            <div className="flex-1 min-h-[160px]">
              {loading
                ? <Skeleton className="h-full" />
                : <ChartComposed data={quizData} xKey="name" barKey="score" lineKey="average" />
              }
            </div>
            <p className="text-[8px] font-medium text-gray-600 uppercase text-center mt-3">Score vs Class Average</p>
          </div>

          {/* Focus Timeline */}
          <div className="bg-gray-950 border border-white/5 rounded-2xl p-6 shadow-lg group min-h-[240px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Weekly Submissions</h3>
              <FiBarChart2 className="text-purple-400 h-4 w-4" />
            </div>
            <div className="flex-1 min-h-[160px]">
              {loading
                ? <Skeleton className="h-full" />
                : <ChartLine data={activityData} xKey="name" yKey="hours" color="#a855f7" />
              }
            </div>
            <p className="text-[8px] font-medium text-gray-600 uppercase text-center mt-3">Assignments submitted per day</p>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID: Activity + Tasks ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* System Events / Activity Feed */}
          <div className="bg-gray-950 border border-white/5 rounded-3xl p-8 flex flex-col shadow-2xl group min-h-[400px]">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                <FiBell className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-tight">Notifications</h2>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Latest updates</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => {
                        if (activity.type === 'enrollment' && activity.courseId) router.push(`/student/learning/${activity.courseId}`);
                        else if (activity.type === 'assignment' && activity.assignmentId) router.push(`/student/assignment-submit/${activity.assignmentId}`);
                        else router.push('/student/notifications');
                    }}
                    className="group/log relative bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-30 rounded-l-xl" />
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center border border-white/5 shrink-0 mt-0.5">
                        {activity.type === 'enrollment'
                          ? <FiBookOpen className="h-3.5 w-3.5 text-indigo-400" />
                          : activity.type === 'assignment'
                          ? <FiCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          : <FiZap className="h-3.5 w-3.5 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-300 leading-snug line-clamp-2">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${
                            activity.type === 'enrollment' ? 'text-indigo-400' :
                            activity.type === 'assignment' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>{activity.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center opacity-30">
                  <FiBell className="h-10 w-10 mx-auto text-gray-700 mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No notifications yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-gray-950 border border-white/5 rounded-3xl p-8 shadow-2xl group flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                  <FiLayers className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-tight">Pending Tasks</h2>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    {activeTasks.length} assignment{activeTasks.length !== 1 ? 's' : ''} due
                  </span>
                </div>
              </div>
              <Link href="/student/assignments" className="text-[9px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-all flex items-center gap-1.5 group/link">
                View All
                <FiArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {loading ? (
                [1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)
              ) : activeTasks.length > 0 ? (
                activeTasks.map((task: any) => (
                  <div 
                    key={task.id} 
                    onClick={() => router.push(`/student/assignment-submit/${task.id}`)}
                    className="group/task relative bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20 rounded-l-2xl" />
                    <div className="relative space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="text-sm font-bold text-white tracking-tight group-hover/task:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                            {task.title}
                          </h3>
                          <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest truncate">{task.course}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                          task.difficulty === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          task.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {task.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <FiClock className="h-3 w-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">{task.deadline}</span>
                        </div>
                        <Link href={`/student/assignment-submit/${task.id}`}>
                          <button className="w-8 h-8 bg-white hover:bg-indigo-200 text-black rounded-lg transition-all flex items-center justify-center active:scale-95">
                            <FiArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-12 text-center opacity-30">
                  <FiCheckCircle className="h-10 w-10 mx-auto text-gray-700 mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No pending tasks</p>
                  <p className="text-[9px] text-gray-600 mt-1">You&apos;re all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ENROLLED COURSES ─────────────────────────────────────────────────── */}
        {enrolledCourses.length > 0 && (
          <div className="bg-gray-950 border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <FiBookOpen className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-tight">My Courses</h2>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Continue where you left off</span>
                </div>
              </div>
              <Link href="/student/courses" className="text-[9px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-all flex items-center gap-1.5 group/link">
                Browse More
                <FiArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {enrolledCourses.map((course: any) => (
                <Link key={course._id || course.id} href={`/student/learning/${course._id || course.id}`}>
                  <div className="group/c bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer">
                    {/* Thumbnail */}
                    <div className="relative h-36 bg-gray-900 overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover/c:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-950">
                          <FiBookOpen className="h-10 w-10 text-indigo-600" />
                        </div>
                      )}
                      {/* Progress overlay badge */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                        {course.progress}% done
                      </div>
                      {/* Category badge */}
                      <div className="absolute bottom-3 left-3 bg-indigo-600/90 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                        {course.category}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight line-clamp-2 leading-snug group-hover/c:text-indigo-400 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <FiStar className="h-3 w-3 text-amber-400" />
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{course.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-700">·</span>
                          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest capitalize">{course.level}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{course.completedLessons || 0} lessons done</span>
                          <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">{course.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <FiClock className="h-3 w-3" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">{course.duration || 0}h total</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <FiPlay className="h-3 w-3" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Continue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

StudentDashboard.allowedRoles = ['student', 'instructor', 'admin'];
export default StudentDashboard;
