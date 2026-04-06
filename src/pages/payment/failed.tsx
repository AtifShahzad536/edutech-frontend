import React from 'react';
import { FiX, FiRefreshCw, FiArrowLeft, FiCreditCard, FiMail } from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';

const PaymentFailedPage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { token } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-16 px-5">
        <div className="max-w-xl w-full space-y-8 text-center">
          
          {/* Failed Header Area */}
          <div className="space-y-6 relative">
            <div className="mx-auto w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] flex items-center justify-center relative">
               <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse" />
               <FiX className="h-10 w-10 text-rose-400 relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight">Payment Failed</h1>
              <p className="text-gray-500 font-medium">We're sorry, but your transaction could not be completed.</p>
            </div>
          </div>

          {/* Error Details Card */}
          <div className="bg-gray-900 border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8 text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full blur-2xl -mr-16 -mt-16" />
             
             <div className="relative z-10">
               <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">What happened?</h2>
               
               <div className="space-y-4">
                 <p className="text-xs text-gray-400 leading-relaxed font-bold">
                   Your payment was declined. This is often caused by:
                 </p>
                 <ul className="space-y-3">
                   {[
                     'Insufficient funds in your account',
                     'Incorrect card details (CVV or Expiry)',
                     'Card has expired or is temporarily blocked',
                     'Bank-side security restrictions'
                   ].map((item, i) => (
                     <li key={i} className="flex gap-3 text-[10px] font-bold text-gray-500">
                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500/40 mt-1" />
                       {item}
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="mt-8 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                 <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest text-center">
                   No charges were made to your account.
                 </p>
               </div>
             </div>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
             <Button 
               href={`/checkout/${courseId || '1'}`} 
               variant="primary" 
               size="lg" 
               className="!bg-rose-600 !border-rose-500 !hover:bg-rose-700"
             >
               <FiRefreshCw className="h-4 w-4 mr-2" />
               Try Again
             </Button>
             <Button 
               href={isAuthenticated ? `/student/courses/${courseId || '1'}` : '/courses'} 
               variant="secondary" 
               size="lg"
             >
               <FiArrowLeft className="h-4 w-4 mr-2" />
               {isAuthenticated ? 'Back to Course' : 'Back to Library'}
             </Button>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6 text-left">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Need Immediate Help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 bg-gray-900/50 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="w-8 h-8 bg-indigo-600/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                    <FiMail className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-[10px] font-bold text-gray-500">
                    support@cyberacademy.com
                  </div>
               </div>
               <div className="p-4 bg-gray-900/50 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="w-8 h-8 bg-indigo-600/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                    <FiCreditCard className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="text-[10px] font-bold text-gray-500">
                    Contact your bank
                  </div>
               </div>
            </div>
          </div>

          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest pt-8">
            Secure 256-bit SSL Encrypted Transaction
          </p>

        </div>
      </div>
    </PublicLayout>
  );
};

export default PaymentFailedPage;
