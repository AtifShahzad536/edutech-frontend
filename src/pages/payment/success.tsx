import React from 'react';
import { FiCheck, FiDownload, FiMail, FiPlay } from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';
import Link from 'next/link';

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { token } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-16 px-5">
        <div className="max-w-xl w-full space-y-8 text-center">
          
          {/* Success Header Area */}
          <div className="space-y-6 relative">
            <div className="mx-auto w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center relative">
               <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
               <FiCheck className="h-10 w-10 text-emerald-400 relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight">Payment Successful!</h1>
              <p className="text-gray-500 font-medium">Thank you for your purchase. Your learning journey begins now.</p>
            </div>
          </div>

          {/* Dynamic Details Card */}
          <div className="bg-gray-900 border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8 text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl -mr-16 -mt-16" />
             
             <div className="relative z-10">
               <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Order Details</h2>
               
               <div className="space-y-6">
                 <div className="flex justify-between items-start pt-4 border-t border-white/5">
                   <div>
                     <p className="text-sm font-black text-white">Complete Web Development Bootcamp</p>
                     <p className="text-xs text-gray-500 mt-1">Full Lifetime Access • Order #88294</p>
                   </div>
                   <p className="text-lg font-black text-white tracking-tight">$89.99</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Date</p>
                      <p className="text-xs text-gray-400 font-bold mt-1">March 15, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Payment Method</p>
                      <p className="text-xs text-gray-400 font-bold mt-1">Credit Card **** 1234</p>
                    </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Next Steps Area */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6 text-left">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">What's Next?</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: FiMail, title: 'Check Email', desc: 'Confirmation & receipt sent.' },
                { icon: FiPlay, title: 'Go to Course', desc: 'Immediate access available.' },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600/20 transition-all">
                    <step.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{step.title}</h4>
                    <p className="text-[10px] text-gray-600 font-bold leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
             <Button 
               href={isAuthenticated ? `/student/dashboard` : '/courses'} 
               variant="primary" 
               size="lg"
             >
               <FiPlay className="h-4 w-4 mr-2" />
               {isAuthenticated ? 'Start Learning' : 'Back to Library'}
             </Button>
             <Button variant="secondary" size="lg">
               <FiDownload className="h-4 w-4 mr-2" />
               View Invoice
             </Button>
          </div>

          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest pt-8">
            Need help? Reach out at <span className="text-indigo-400">support@cyberacademy.com</span>
          </p>

        </div>
      </div>
    </PublicLayout>
  );
};

export default PaymentSuccessPage;
