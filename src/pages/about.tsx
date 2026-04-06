import React from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { FiUsers, FiBookOpen, FiAward, FiGlobe, FiCheckCircle } from 'react-icons/fi';

const stats = [
  { value: '45K+', label: 'Students Worldwide' },
  { value: '800+', label: 'Courses Available' },
  { value: '150+', label: 'Expert Instructors' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const team = [
  { name: 'Sarah Johnson', role: 'CEO & Co-Founder', initials: 'SJ', color: 'bg-indigo-600' },
  { name: 'Dr. Michael Chen', role: 'Head of Curriculum', initials: 'MC', color: 'bg-blue-600' },
  { name: 'Emily Davis', role: 'Lead Designer', initials: 'ED', color: 'bg-purple-600' },
  { name: 'Alex Thompson', role: 'CTO', initials: 'AT', color: 'bg-cyan-600' },
];

const values = [
  { icon: FiBookOpen, title: 'Quality First', desc: 'Every course is reviewed by experts before it goes live. We only publish content that meets a high standard.' },
  { icon: FiUsers, title: 'Student Focused', desc: 'Everything we build is designed around helping students learn faster, smarter, and with less stress.' },
  { icon: FiAward, title: 'Recognised Certificates', desc: 'Our certificates are trusted by employers globally. They are a real proof of your hard work and skills.' },
  { icon: FiGlobe, title: 'Open to Everyone', desc: 'We believe education should be affordable and accessible — no matter where you are in the world.' },
];

const AboutPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="bg-gray-950 text-gray-300">

        {/* Hero */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              We Make Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Simple</span>
            </h1>
            <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              EduTech was founded with one goal — to make quality education available to everyone. We bring together the best instructors and a community of passionate learners to help people grow, no matter where they start.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-white/5 bg-gray-900/40">
          <div className="max-w-5xl mx-auto px-5 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-5 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Our Mission</p>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  Building Skills That Actually Matter
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We do not just teach theory — we focus on real, practical skills that employers need. Our courses are built to be hands-on, relevant, and up-to-date with what is happening in each industry.
                </p>
                <ul className="space-y-3">
                  {['Expert instructors with real industry experience', 'Practical projects and hands-on assignments', 'Regular content updates to stay current', 'Supportive student community'].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <FiCheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {values.map((v, i) => (
                  <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-3 hover:border-indigo-500/20 transition-colors">
                    <div className="w-9 h-9 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                      <v.icon className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{v.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-gray-900/30 border-y border-white/5">
          <div className="max-w-5xl mx-auto px-5 lg:px-8">
            <div className="text-center mb-12 space-y-3">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">The Team</p>
              <h2 className="text-3xl font-black text-white">The People Behind EduTech</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((t, i) => (
                <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-6 text-center space-y-3 hover:border-indigo-500/20 transition-colors">
                  <div className={`w-14 h-14 ${t.color} rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-indigo-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-5">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-black text-white">Ready to Start Learning?</h2>
            <p className="text-gray-500 text-sm">Join 45,000+ students and start building skills that matter today.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/courses">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all">
                  Browse Courses
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-8 py-3 rounded-xl font-bold text-sm transition-all">
                  Create Free Account
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default AboutPage;
