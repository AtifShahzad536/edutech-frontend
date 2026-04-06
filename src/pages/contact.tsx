import React, { useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { FiMail, FiMessageSquare, FiPhone, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';

const contactInfo = [
  { icon: FiMail, label: 'Email Us', value: 'support@edutech.com', sub: 'We reply within 24 hours' },
  { icon: FiPhone, label: 'Call Us', value: '+1 (800) 555-0190', sub: 'Mon–Fri, 9am–6pm EST' },
  { icon: FiMapPin, label: 'Office', value: '123 Learning Ave, NY', sub: 'New York, USA' },
];

const faqs = [
  { q: 'Can I get a refund?', a: 'Yes — we offer a full 30-day money-back guarantee on all courses, no questions asked.' },
  { q: 'Do I get a certificate?', a: 'Yes, you receive a certificate after completing any course. You can share it on LinkedIn.' },
  { q: 'How long can I access a course?', a: 'You get lifetime access to any course you enroll in, including all future updates.' },
  { q: 'Can I learn on my phone?', a: 'Absolutely. Our platform works on all devices — phone, tablet, laptop, or desktop.' },
];

const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <div className="bg-gray-950 text-gray-300">

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-8 text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              We're Here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Help</span>
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
              Have a question about a course, need help with your account, or just want to say hello? Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact cards */}
        <section className="pb-16">
          <div className="max-w-5xl mx-auto px-5 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {contactInfo.map((c, i) => (
                <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-6 flex gap-4 items-start hover:border-indigo-500/20 transition-colors">
                  <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <c.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{c.label}</p>
                    <p className="text-sm font-bold text-white">{c.value}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form + FAQ */}
        <section className="pb-24">
          <div className="max-w-5xl mx-auto px-5 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* Form */}
              <div className="lg:col-span-3 bg-gray-900 border border-white/5 rounded-2xl p-8">
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="w-8 h-8 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                    <FiMessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <h2 className="text-base font-black text-white">Send us a Message</h2>
                </div>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                    <div className="w-14 h-14 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                      <FiCheckCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black text-white">Message Sent!</h3>
                    <p className="text-sm text-gray-500">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Name</label>
                        <input
                          required
                          type="text"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                        <input
                          required
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Subject</label>
                      <input
                        required
                        type="text"
                        placeholder="What is your message about?"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Message</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Write your message here..."
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <FiSend className="h-4 w-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* FAQ */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-base font-black text-white mb-5">Common Questions</h2>
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5 space-y-2 hover:border-indigo-500/20 transition-colors">
                    <p className="text-sm font-bold text-white">{faq.q}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default ContactPage;
