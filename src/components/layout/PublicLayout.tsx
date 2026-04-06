import React, { memo, useState } from 'react';
import Link from 'next/link';
import {
  FiSearch, FiTwitter, FiLinkedin, FiYoutube,
  FiBookOpen, FiMenu, FiX, FiInstagram, FiChevronDown,
  FiCode, FiBarChart2, FiPenTool, FiBriefcase, FiCamera,
  FiMusic, FiGlobe, FiCpu, FiChevronRight
} from 'react-icons/fi';
import { useAppSelector } from '@/hooks/useRedux';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const footerLinks = {
  Platform: ['Browse Courses', 'Become an Instructor', 'Live Classes', 'Certifications'],
  Resources: ['Blog', 'Career Guide', 'Student Stories', 'Scholarships'],
  Support: ['Help Center', 'Contact Us', 'Accessibility', 'Community Forum'],
};

const categories = [
  { icon: FiCode,      label: 'Programming',  href: '/courses?cat=programming' },
  { icon: FiBarChart2, label: 'Data Science', href: '/courses?cat=data-science' },
  { icon: FiPenTool,   label: 'Design',       href: '/courses?cat=design' },
  { icon: FiBriefcase, label: 'Business',     href: '/courses?cat=business' },
  { icon: FiGlobe,     label: 'Marketing',    href: '/courses?cat=marketing' },
  { icon: FiCamera,    label: 'Photography',  href: '/courses?cat=photography' },
  { icon: FiMusic,     label: 'Music',        href: '/courses?cat=music' },
  { icon: FiCpu,       label: 'IT & Software',href: '/courses?cat=it' },
];

const PublicLayout = memo<PublicLayoutProps>(({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [catOpen, setCatOpen]             = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col">

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/90 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-[2560px] w-[98%] mx-auto px-6 lg:px-8">
          <div className="flex items-center h-16 gap-6">

            {/* ── LEFT: Logo + Categories ── */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Logo */}
              <Link href="/" className="flex items-center group">
                <img src="/logo.png" alt="EduTech Logo" className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
              </Link>

              {/* Divider */}
              <div className="hidden md:block w-px h-5 bg-white/10" />

              {/* Categories */}
              <div className="hidden md:block relative">
                <button
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  Explore
                  <FiChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
                </button>

                {catOpen && (
                  <div
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                    className="absolute top-full left-0 mt-2 w-52 bg-gray-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden py-2 z-50"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all group"
                      >
                        <cat.icon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        {cat.label}
                        <FiChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                      </Link>
                    ))}
                    <div className="border-t border-white/5 mt-2 pt-2 px-4 pb-1">
                      <Link href="/courses" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                        View All Courses →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── CENTRE: Search bar (centered) ── */}
            <div className="flex-1 hidden lg:flex items-center justify-center px-8">
              <div className="relative group w-full max-w-3xl">
                <FiSearch className="absolute left-3.5 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors z-10" />
                <input
                  type="text"
                  placeholder="Search for courses, skills, instructors..."
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            {/* ── RIGHT: Nav links + Auth ── */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Secondary links — visible on xl only to avoid crowding */}
              <div className="hidden xl:flex items-center gap-2">
                {[
                  { label: 'Teach', href: '/instructor/apply' },
                  { label: 'About', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="hidden xl:block w-px h-5 bg-white/10" />

              {/* Auth */}
              {user ? (
                <Link href={user.role === 'student' ? '/student/dashboard' : '/instructor/dashboard'}>
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.06]">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                      Join Free
                    </button>
                  </Link>
                </div>
              )}

              {/* Hamburger (mobile) */}
              <button
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all ml-1"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ──────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-gray-950/98 backdrop-blur-2xl px-5 py-5 space-y-1">
            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
              />
            </div>

            {/* Categories accordion */}
            <button
              onClick={() => setMobileCatOpen(!mobileCatOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Explore Categories
              <FiChevronDown className={`h-4 w-4 transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileCatOpen && (
              <div className="ml-3 space-y-0.5 border-l border-white/5 pl-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <cat.icon className="h-3.5 w-3.5 text-indigo-400" />
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Other links */}
            {[
              { label: 'Browse All Courses', href: '/courses' },
              { label: 'Become an Instructor', href: '/instructor/apply' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Auth */}
            <div className="pt-3 mt-3 border-t border-white/5 flex flex-col gap-2">
              {!user && (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  Sign In
                </Link>
              )}
              <Link href={user ? (user.role === 'student' ? '/student/dashboard' : '/instructor/dashboard') : '/signup'} onClick={() => setMobileOpen(false)}>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap">
                  {user ? 'Go to Dashboard' : 'Join Free'}
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16">{children}</main>

      <footer className="bg-gray-950 border-t border-white/5 pt-20 pb-10">
        <div className="max-w-[2560px] w-[98%] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 2xl:gap-24 mb-16">
            <div className="lg:col-span-2 space-y-5 max-w-xs">
              <Link href="/" className="flex items-center group">
                <img src="/logo.png" alt="EduTech Logo" className="h-12 w-auto object-contain" />
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                Learn new skills, earn certificates, and advance your career. Trusted by 45,000+ students worldwide.
              </p>
              <div className="flex gap-3">
                {[FiTwitter, FiLinkedin, FiYoutube, FiInstagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 hover:bg-indigo-600 hover:border-indigo-600 text-gray-500 hover:text-white transition-all">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-5">
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-base font-bold text-white mb-1">Stay in the loop</h4>
              <p className="text-sm text-gray-500">Get the latest courses and learning tips in your inbox.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">© 2025 EduTech. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(item => (
                <a key={item} href="#" className="text-xs text-gray-600 hover:text-indigo-400 transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

PublicLayout.displayName = 'PublicLayout';
export default PublicLayout;
