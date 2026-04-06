import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import {
  FiHome, FiBook, FiUsers, FiSettings, FiMenu, FiSearch, FiUser,
  FiLogOut, FiBell, FiX, FiChevronDown, FiCpu, FiVideo, FiBookOpen,
  FiTrendingUp, FiDollarSign, FiBarChart2, FiLayers, FiShield, FiZap
} from 'react-icons/fi';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/uiSlice';
import { logoutUser } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import clsx from 'clsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hidePadding?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, hideHeader = false, hidePadding = false }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/login');
  };

  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Dashboard', href: '/student/dashboard', icon: FiHome },
      { name: 'Courses', href: '/student/courses', icon: FiBook },
      { name: 'My Learning', href: '/student/my-courses', icon: FiBookOpen },
      { name: 'Live Classes', href: '/student/live-syncs', icon: FiVideo },
      { name: 'Recommended', href: '/student/recommendations', icon: FiCpu },
    ];

    if (!user) return commonItems;

    switch (user.role) {
      case 'student':
        return [
          ...commonItems,
          { name: 'Assignments', href: '/student/assignments', icon: FiLayers },
          { name: 'Community', href: '/student/discussions', icon: FiUsers },
          { name: 'Log Case', href: '/student/profile', icon: FiUser },
        ];
      case 'instructor':
        return [
          { name: 'Dashboard', href: '/instructor/dashboard', icon: FiHome },
          { name: 'My Courses', href: '/instructor/courses', icon: FiBookOpen },
          { name: 'Live Classes', href: '/instructor/live-syncs', icon: FiVideo },
          { name: 'Create Course', href: '/instructor/create-course', icon: FiZap },
          { name: 'Assignments', href: '/instructor/assignments', icon: FiLayers },
          { name: 'Students', href: '/instructor/students', icon: FiUsers },
          { name: 'Analytics', href: '/instructor/analytics', icon: FiTrendingUp },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: FiShield },
          { name: 'Users', href: '/admin/users', icon: FiUsers },
          { name: 'Live Classes', href: '/instructor/live-syncs', icon: FiVideo },
          { name: 'Courses', href: '/admin/courses', icon: FiBookOpen },
          { name: 'Assignments', href: '/instructor/assignments', icon: FiLayers },
          { name: 'Payments', href: '/admin/payments', icon: FiDollarSign },
          { name: 'Reports', href: '/admin/reports', icon: FiBarChart2 },
          { name: 'Settings', href: '/admin/settings', icon: FiSettings },
        ];
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-black selection:bg-indigo-500/30 flex text-gray-300 font-sans">
      {/* Premium Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-950/80 backdrop-blur-3xl border-r border-white/5 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Sidebar Branding (Centered) */}
        <div className="flex flex-col items-center justify-center pt-10 pb-6 px-6 relative border-b border-white/5">
          <Link href="/" className="group flex flex-col items-center transition-transform duration-500 hover:scale-105">
            <img src="/logo.png" alt="EduTech Logo" className="h-16 w-auto object-contain" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden absolute top-4 right-2 text-gray-500"
            onClick={() => dispatch(setSidebarOpen(false))}
          >
            <FiX className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-8 custom-scrollbar overflow-y-auto h-[calc(100vh-160px)]">
          {/* Minimalist Profile Section */}

          <ul className="space-y-1">
            <li className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] px-3 mb-3">Main Menu</li>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'group flex items-center px-3 py-3 text-[11px] font-medium rounded-lg transition-all duration-300 relative',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg border border-white/10'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className={clsx(
                      'mr-3 h-4 w-4 transition-colors',
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-indigo-400'
                    )} />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pt-6 mt-6 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-[11px] font-medium text-gray-600 hover:text-red-500 rounded-lg transition-all group"
            >
              <FiLogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-hidden">
        {/* Header */}
        {!hideHeader && (
          <header className="h-20 bg-black/60 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-40 px-6 md:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-12 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white"
                onClick={() => dispatch(toggleSidebar())}
              >
                <FiMenu className="h-6 w-6" />
              </Button>

              <div className="hidden lg:flex flex-1 max-w-lg relative group">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full bg-white/5 border border-white/5 rounded-lg py-3 pl-12 pr-6 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/30 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-10">
              <div className="relative group">
                <NotificationCenter />
              </div>

              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center border border-white/10">
                    <span className="text-[10px] font-bold text-white">{user?.firstName?.[0] || 'U'}</span>
                  </div>
                  <div className="hidden xl:block text-left leading-none">
                    <p className="text-xs font-semibold text-white">{user?.firstName || 'User'}</p>
                  </div>
                  <FiChevronDown className={clsx(
                    'h-3 w-3 text-gray-600 transition-transform',
                    showUserMenu ? 'rotate-180 text-white' : ''
                  )} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-4 min-w-[200px] bg-gray-950 border border-white/10 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      {[
                        { name: 'Profile', href: `/${user?.role || 'student'}/profile`, icon: FiUser },
                        { name: 'Settings', href: `/${user?.role || 'student'}/settings`, icon: FiSettings },
                        { name: 'Inbox', href: `/${user?.role || 'student'}/notifications`, icon: FiBell },
                      ].map(link => (
                        <button
                          key={link.name}
                          onClick={() => { router.push(link.href); setShowUserMenu(false); }}
                          className="w-full flex items-center px-3 py-2 text-[11px] font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <link.icon className="mr-3 h-4 w-4" />
                          {link.name}
                        </button>
                      ))}
                      <div className="h-px bg-white/5 my-2" />
                      <button
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="w-full flex items-center px-3 py-2 text-[11px] font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <FiLogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className={clsx(
          "flex-1 min-w-0 overflow-y-auto custom-scrollbar",
          !hidePadding && "px-4 sm:px-6 md:px-8 2xl:px-12 py-8 2xl:py-12"
        )}>
          <div className={clsx(!hidePadding && "max-w-[1920px] w-[96%] mx-auto transition-all duration-500")}>
            {children}
          </div>
        </main>
      </div>

      {/* Neural Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-500"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
