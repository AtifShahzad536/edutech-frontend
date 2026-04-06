import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PublicLayout from '@/components/layout/PublicLayout';
import { FiCheckCircle, FiUsers, FiAward, FiDollarSign, FiGlobe, FiSend, FiBookOpen, FiTrendingUp } from 'react-icons/fi';

const perks = [
  { icon: FiDollarSign, title: 'Earn Money',       desc: 'Set your own course price and earn revenue every time a student enrolls.' },
  { icon: FiUsers,      title: 'Reach Students',   desc: 'Teach 45,000+ motivated learners from over 150 countries.' },
  { icon: FiAward,      title: 'Build Authority',  desc: 'Establish yourself as an expert in your field with a professional profile.' },
  { icon: FiTrendingUp, title: 'Grow Your Brand',  desc: 'Use our platform to grow your audience and personal brand.' },
];

const steps = [
  { num: '01', title: 'Apply',        desc: 'Fill in the form below — tell us about yourself and your teaching area.' },
  { num: '02', title: 'Get Reviewed', desc: 'Our team reviews your application within 2–3 business days.' },
  { num: '03', title: 'Get Approved', desc: 'Once approved, you get access to the full instructor dashboard.' },
  { num: '04', title: 'Start Teaching', desc: 'Create your first course and start earning from day one.' },
];

const InstructorApplyPage: React.FC = () => {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    expertise: '', experience: '', bio: '', social: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const update = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all";
  const labelCls = "text-xs font-bold uppercase tracking-wider text-gray-500";

  return (
    <PublicLayout>
      <div className="bg-gray-950 text-gray-300">

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-8 text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Join Our Instructor Team
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Share Your Knowledge,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                Earn Money
              </span>
            </h1>
            <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
              Join hundreds of expert instructors already teaching on EduTech. Create your course, reach thousands of students, and build a passive income stream.
            </p>
          </div>
        </section>

        {/* Perks */}
        <section className="pb-16">
          <div className="max-w-5xl mx-auto px-5 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {perks.map((p, i) => (
                <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-3 hover:border-indigo-500/20 transition-colors">
                  <div className="w-9 h-9 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                    <p.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-gray-900/30 border-y border-white/5">
          <div className="max-w-5xl mx-auto px-5 lg:px-8">
            <h2 className="text-2xl font-black text-white mb-10 text-center">How It Works</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-sm font-black text-indigo-400">{s.num}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{s.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto px-5 lg:px-8">
            <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 md:p-10">

              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                  <FiBookOpen className="h-4 w-4 text-indigo-400" />
                </div>
                <h2 className="text-lg font-black text-white">Apply to Become an Instructor</h2>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center py-12 space-y-4 text-center">
                  <div className="w-14 h-14 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <FiCheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-white">Application Submitted!</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Thank you for applying! We will review your application and get back to you within 2–3 business days.
                  </p>
                  <Link href="/">
                    <button className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
                      Back to Home
                    </button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>First Name</label>
                      <input required type="text" placeholder="John" className={inputCls}
                        value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Last Name</label>
                      <input required type="text" placeholder="Doe" className={inputCls}
                        value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Email Address</label>
                      <input required type="email" placeholder="you@example.com" className={inputCls}
                        value={form.email} onChange={e => update('email', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Phone (optional)</label>
                      <input type="tel" placeholder="+1 234 567 8900" className={inputCls}
                        value={form.phone} onChange={e => update('phone', e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Area of Expertise</label>
                    <select required className={inputCls + ' appearance-none cursor-pointer'}
                      value={form.expertise} onChange={e => update('expertise', e.target.value)}>
                      <option value="" disabled className="bg-gray-900">Select your main subject</option>
                      {['Programming', 'Data Science', 'Design', 'Business', 'Marketing', 'Photography', 'Music', 'IT & Software', 'Other'].map(o => (
                        <option key={o} value={o} className="bg-gray-900">{o}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Years of Experience</label>
                    <select required className={inputCls + ' appearance-none cursor-pointer'}
                      value={form.experience} onChange={e => update('experience', e.target.value)}>
                      <option value="" disabled className="bg-gray-900">Select your experience</option>
                      {['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', 'More than 10 years'].map(o => (
                        <option key={o} value={o} className="bg-gray-900">{o}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Short Bio</label>
                    <textarea required rows={4} placeholder="Tell us a little about yourself and your teaching background..."
                      className={inputCls + ' resize-none'}
                      value={form.bio} onChange={e => update('bio', e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>LinkedIn or Portfolio URL (optional)</label>
                    <input type="url" placeholder="https://linkedin.com/in/yourname" className={inputCls}
                      value={form.social} onChange={e => update('social', e.target.value)} />
                  </div>

                  <button type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 mt-2">
                    <FiSend className="h-4 w-4" />
                    Submit Application
                  </button>

                  <p className="text-xs text-gray-600 text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default InstructorApplyPage;
