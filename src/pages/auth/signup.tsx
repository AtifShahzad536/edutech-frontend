import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { registerUser } from '@/store/slices/authSlice';
import {
  FiMail, FiLock, FiUser, FiEye, FiEyeOff,
  FiCheckCircle, FiStar, FiShield, FiTrendingUp
} from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'instructor';
  agreeToTerms: boolean;
}

const perks = [
  { icon: FiCheckCircle, text: 'Free account — no credit card needed' },
  { icon: FiTrendingUp, text: 'Track your progress with detailed analytics' },
  { icon: FiStar, text: 'Personalised course recommendations' },
  { icon: FiShield, text: '30-day money-back guarantee on all courses' },
];

const SignupPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      const result = await dispatch(registerUser(registerData)).unwrap();
      switch (result.user.role) {
        case 'student': router.push('/student/dashboard'); break;
        case 'instructor': router.push('/instructor/dashboard'); break;
        default: router.push('/student/dashboard');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-72px)] flex">
        {/* ── Left panel: Form ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-14 bg-gray-950">
          <div className="w-full max-w-xl space-y-7">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">Create Your Account</h1>
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-medium">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">First Name</label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      placeholder="John"
                      autoComplete="given-name"
                      className={`w-full bg-white/5 border ${errors.firstName ? 'border-red-500/50' : 'border-white/10'} py-3.5 pl-11 pr-4 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/60 transition-all`}
                      {...register('firstName', { required: 'Required' })}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Last Name</label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      placeholder="Smith"
                      autoComplete="family-name"
                      className={`w-full bg-white/5 border ${errors.lastName ? 'border-red-500/50' : 'border-white/10'} py-3.5 pl-11 pr-4 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/60 transition-all`}
                      {...register('lastName', { required: 'Required' })}
                    />
                  </div>
                  {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} py-3.5 pl-11 pr-4 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/60 transition-all`}
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Role + Password row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">I am joining as...</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 py-3.5 px-4 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer"
                    {...register('role', { required: true })}
                  >
                    <option value="student" className="bg-gray-900">Student</option>
                    <option value="instructor" className="bg-gray-900">Instructor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} py-3.5 pl-11 pr-12 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/60 transition-all`}
                      {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min. 8 characters' } })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>
              </div>

              {/* Terms agreement */}
              <label className="flex items-start gap-3 pt-1 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('agreeToTerms', { required: 'You must accept the terms to continue' })}
                  />
                  <div className="w-5 h-5 bg-white/5 border border-white/10 rounded-md peer-checked:bg-indigo-600 group-hover:border-indigo-500/50 transition-all" />
                  <div className="absolute hidden peer-checked:block text-white text-[10px] pointer-events-none">✓</div>
                </div>
                <span className="text-sm text-gray-500 leading-relaxed">
                  I agree to the{' '}
                  <Link href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors" onClick={(e) => e.stopPropagation()}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-xs text-red-400 -mt-2">{errors.agreeToTerms.message}</p>}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all"
                loading={isLoading}
              >
                Create My Free Account
              </Button>

              {/* Trust note */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 pt-1">
                <FiShield className="h-3.5 w-3.5 text-emerald-500" />
                <span>Your information is 100% secure and never shared.</span>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="hidden lg:flex w-5/12 relative bg-gradient-to-bl from-indigo-900 via-gray-950 to-gray-950 items-center justify-center overflow-hidden border-l border-white/5 px-12 py-16">
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] -mb-40 -mr-40" />
          <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -mt-20 -ml-20" />

          <div className="relative z-10 max-w-sm space-y-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Join Today</p>
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                Start Learning <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  For Free
                </span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Create your account in seconds and get instant access to foundational courses at no cost.
              </p>
            </div>

            {/* Perks */}
            <ul className="space-y-4">
              {perks.map((p, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <p.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{p.text}</span>
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '45K+', label: 'Active Students' },
                { value: '800+', label: 'Courses' },
                { value: '4.9★', label: 'Avg. Rating' },
                { value: 'Free', label: 'To Get Started' },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default SignupPage;
