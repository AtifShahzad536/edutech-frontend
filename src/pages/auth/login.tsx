import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { loginUser } from '@/store/slices/authSlice';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiBookOpen,
  FiCheckCircle, FiStar, FiUsers, FiAward, FiInfo
} from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';

interface LoginFormData {
  email: string;
  password: string;
}

const benefits = [
  { icon: FiBookOpen, text: 'Access 800+ expert-led courses' },
  { icon: FiAward, text: 'Earn industry-recognised certificates' },
  { icon: FiUsers, text: 'Join a global community of 45,000+ learners' },
  { icon: FiStar, text: 'Learn at your own pace, on any device' },
];

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      // If there's a redirect param (e.g. from trying to enroll as guest), go there
      const redirect = router.query.redirect as string;
      if (redirect) {
        router.push(redirect);
        return;
      }
      switch (result.user.role) {
        case 'student': router.push('/student/dashboard'); break;
        case 'instructor': router.push('/instructor/dashboard'); break;
        case 'admin': router.push('/admin/dashboard'); break;
        default: router.push('/student/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-72px)] flex">
        {/* ── Left panel ── */}
        <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-indigo-900 via-gray-950 to-gray-950 items-center justify-center overflow-hidden border-r border-white/5 px-12 py-16">
          {/* Ambient */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] -mt-40 -ml-40" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -mb-20 -mr-20" />

          <div className="relative z-10 max-w-md space-y-10">
            {/* Heading */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Welcome Back</p>
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                Continue Where <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  You Left Off
                </span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sign in to access your courses, track your progress, and pick up right where you stopped.
              </p>
            </div>

            {/* Benefits list */}
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <b.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{b.text}</span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="flex -space-x-2 flex-shrink-0">
                {['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-gray-900`} />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[1,2,3,4,5].map(i => <FiStar key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Rated <strong className="text-white">4.9/5</strong> by over 12,000 students
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: Form ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-14 bg-gray-950">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">Sign In</h1>
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Redirect notice for guests trying to enroll */}
            {router.query.redirect && (
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                <FiInfo className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-indigo-300">
                  Please sign in to complete your enrollment. Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-bold underline">Create one free</Link>.
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} py-4 pl-11 pr-4 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/60 transition-all`}
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
                  <Link href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} py-4 pl-11 pr-12 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500/60 transition-all`}
                    {...register('password', { required: 'Password is required' })}
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

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-5 h-5 bg-white/5 border border-white/10 rounded-md peer-checked:bg-indigo-600 transition-all" />
                  <div className="absolute hidden peer-checked:block text-white text-[10px] pointer-events-none">✓</div>
                </div>
                <span className="text-sm text-gray-500 group-hover:text-gray-400 select-none">Remember me for 30 days</span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all"
                loading={isLoading}
              >
                Sign In to Your Account
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-white/5" />
                <span className="text-xs text-gray-700 font-medium">OR</span>
                <div className="flex-1 border-t border-white/5" />
              </div>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <FiCheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Your data is safe and encrypted.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
