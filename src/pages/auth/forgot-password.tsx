import React, { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/5 blur-[150px] opacity-20" />
        
        <div className="max-w-md w-full space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
              Key <span className="text-red-600">Recovery</span>
            </h2>
            <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.5em]">
              Initiate password reset protocol
            </p>
          </div>

          {!isSubmitted ? (
            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 ml-2">Network_Identity</label>
                  <div className="relative group">
                    <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="email"
                      placeholder="IDENTITY@NODE.IO"
                      className="w-full bg-white/5 border border-white/5 py-5 pl-14 pr-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-white placeholder-gray-800 focus:outline-none focus:border-red-500/30 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all scale-105"
                  loading={isLoading}
                  disabled={!email}
                >
                  SEND_RECOVERY_LINK
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <FiArrowLeft className="h-4 w-4 mr-2" />
                    Return_to_Terminal
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-red-600/20 border border-red-500/30 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(220,38,38,0.2)]">
                <FiMail className="h-10 w-10 text-red-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                  Transmission <span className="text-red-600">Sent</span>
                </h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                  Recovery protocol dispatched to:<br />
                  <span className="text-white mt-2 block">{email}</span>
                </p>
              </div>
              
              <div className="pt-6 space-y-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase text-gray-700 tracking-[0.2em]">
                  No transmission received?{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-red-600 hover:text-white transition-colors ml-2"
                  >
                    RETRY_UP_LINK
                  </button>
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500 transition-colors"
                >
                  <FiArrowLeft className="h-4 w-4 mr-2" />
                  Return_to_Terminal
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForgotPasswordPage;
