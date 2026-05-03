import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiSettings, FiShield } from 'react-icons/fi';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <Head>
        <title>System Maintenance | EduTech</title>
      </Head>

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-12 bg-white/[0.02] border border-white/5 p-12 md:p-20 rounded-[3rem] shadow-2xl backdrop-blur-xl">
        
        {/* Icon Animation */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative h-full w-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden group">
            <FiSettings className="w-12 h-12 text-cyan-400 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-cyan-400">System Offline</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            Scheduled <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Maintenance</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
            We are currently upgrading our core infrastructure to bring you an even better learning experience. 
            <br className="hidden md:block" />
            <span className="text-white font-bold">Please check back shortly.</span>
          </p>
        </div>

        <div className="pt-8 border-t border-white/5">
          <Link href="/login" className="inline-flex items-center space-x-2 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-cyan-400 transition-colors">
            <FiShield className="w-3 h-3" />
            <span>Admin Backdoor Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Make sure it doesn't require auth Layout
MaintenancePage.noLayout = true;
