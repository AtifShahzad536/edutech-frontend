import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FiCreditCard, 
  FiLock, 
  FiCheck, 
  FiArrowLeft, 
  FiShoppingCart, 
  FiBookOpen, 
  FiStar 
} from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import clsx from 'clsx';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { enrollCourse } from '@/store/slices/courseSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { AuthenticatedPage } from '@/types';
import API_URL from '@/config/api';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const CheckoutPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { courseId } = router.query;
  const { user, token } = useAppSelector((state) => state.auth);
  const { courses } = useAppSelector((state) => state.courses);
  const isAuthenticated = !!token;

  // Find actual course from store
  const actualCourse = useMemo(() => 
    courses.find(c => String(c.id) === String(courseId)), 
    [courses, courseId]
  );
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    billingAddress: {
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
  });

  // Mock course data for UI if actual course not found
  const courseData = useMemo(() => {
    if (actualCourse) return actualCourse;
    return {
      id: courseId,
      title: 'Complete Web Development Bootcamp',
      instructor: { firstName: 'John', lastName: 'Doe' },
      price: 89.99,
      originalPrice: 199.99,
      rating: 4.8,
      reviewsCount: 1234,
      studentsCount: 15420,
      duration: 42,
      category: 'development',
      level: 'beginner',
      description: 'Learn web development from scratch with HTML, CSS, JavaScript, React, Node.js and more.',
      thumbnail: '/images/course1.jpg',
      features: [
        '42 hours of video content',
        'Downloadable resources',
        'Certificate of completion',
        'Lifetime access',
        'Mobile and TV access',
        'Assignments with feedback',
      ],
    };
  }, [courseId, actualCourse]);

  const handleBillingChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push(`/login?redirect=/checkout/${courseId}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      const storedToken = token || localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/payments/checkout`, {
        courseIds: [courseId]
      }, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      if (response.data.success && response.data.data) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.data;
      } else {
        alert('Failed to initiate checkout. Please try again.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Checkout Error:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired or your user record was not found. Please log out and log back in to refresh your account.');
      } else {
        alert(error.response?.data?.message || 'Payment initiation failed.');
      }
      setIsProcessing(false);
    }
  };


  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-950 py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          
          {/* Header */}
          <div className="mb-12 space-y-4">
            <Link
              href={isAuthenticated ? `/student/courses/${courseId}` : '/courses'}
              className="inline-flex items-center text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <FiArrowLeft className="h-3.5 w-3.5 mr-2" />
              {isAuthenticated ? 'Back to Course' : 'Back to Library'}
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tight">Complete your purchase</h1>
            <p className="text-gray-500 font-medium">Please review your order and select a payment method below.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Col: Forms */}
            <div className="lg:col-span-8 space-y-8">
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Payment Method Selector */}
                <div className="bg-gray-900 border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                      <FiCreditCard className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-black text-white tracking-tight">Payment Method</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label 
                      className={clsx(
                        'flex items-center p-5 border rounded-2xl cursor-pointer transition-all duration-200 group',
                        paymentMethod === 'card' 
                          ? 'bg-indigo-600/5 border-indigo-500/40' 
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="hidden"
                      />
                      <div className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all',
                        paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-500' : 'border-white/10'
                      )}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <FiCreditCard className={clsx('h-5 w-5 mr-3 transition-colors', paymentMethod === 'card' ? 'text-indigo-400' : 'text-gray-600')} />
                      <span className={clsx('text-sm font-bold', paymentMethod === 'card' ? 'text-white' : 'text-gray-500')}>Credit/Debit Card</span>
                    </label>
                    
                    <label 
                      className={clsx(
                        'flex items-center p-5 border rounded-2xl cursor-pointer transition-all duration-200 group',
                        paymentMethod === 'paypal' 
                          ? 'bg-indigo-600/5 border-indigo-500/40' 
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="hidden"
                      />
                      <div className={clsx(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-all',
                        paymentMethod === 'paypal' ? 'border-indigo-500 bg-indigo-500' : 'border-white/10'
                      )}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span className={clsx('text-sm font-black italic tracking-tighter', paymentMethod === 'paypal' ? 'text-blue-400' : 'text-gray-600')}>PayPal</span>
                    </label>
                  </div>
                </div>

                {/* We remove the local card form and rely on Stripe's hosted checkout */}

                {/* Billing Address */}
                <div className="bg-gray-900 border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8">
                   <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                      <FiShoppingCart className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-black text-white tracking-tight">Billing Address</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.billingAddress.email}
                      onChange={(e) => handleBillingChange('email', e.target.value)}
                      required
                      className="!bg-white/[0.02]"
                    />
                    
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        value={formData.billingAddress.firstName}
                        onChange={(e) => handleBillingChange('firstName', e.target.value)}
                        required
                        className="!bg-white/[0.02]"
                      />
                      <Input
                        label="Last Name"
                        value={formData.billingAddress.lastName}
                        onChange={(e) => handleBillingChange('lastName', e.target.value)}
                        required
                        className="!bg-white/[0.02]"
                      />
                    </div>
                    
                    <Input
                      label="Address"
                      value={formData.billingAddress.address}
                      onChange={(e) => handleBillingChange('address', e.target.value)}
                      required
                      className="!bg-white/[0.02]"
                    />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <Input
                        label="City"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleBillingChange('city', e.target.value)}
                        required
                        className="!bg-white/[0.02]"
                      />
                      <Input
                        label="State / Province"
                        value={formData.billingAddress.state}
                        onChange={(e) => handleBillingChange('state', e.target.value)}
                        required
                        className="!bg-white/[0.02]"
                      />
                      <Input
                        label="ZIP Status"
                        value={formData.billingAddress.zipCode}
                        onChange={(e) => handleBillingChange('zipCode', e.target.value)}
                        required
                        className="!bg-white/[0.02] col-span-2 sm:col-span-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Sticky Button Container */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    className="w-full"
                    variant="primary"
                    size="lg"
                    loading={isProcessing}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Connecting...' : `Secure Checkout - ${formatCurrency(courseData.price)}`}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Col: Order Summary Stick */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 bg-gray-900 border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl -mr-16 -mt-16" />
                
                <h2 className="text-lg font-black text-white tracking-tight relative z-10">Order Summary</h2>
                
                {/* Course Card Summary */}
                <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 border border-white/5 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <FiBookOpen className="h-8 w-8 text-indigo-400/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{courseData.title}</p>
                    <p className="text-xs text-gray-500 mt-1">By {courseData.instructor?.firstName} {courseData.instructor?.lastName}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <FiStar className="h-3 w-3 text-yellow-500 fill-current" />
                       <span className="text-[10px] font-bold text-gray-400">{courseData.rating} ({courseData.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-4 pt-4 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Original Price</span>
                    <span className="text-gray-400 line-through font-medium">{formatCurrency(courseData.originalPrice || courseData.price * 1.5)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Platform Discount</span>
                    <span className="text-emerald-400 font-bold">-{formatCurrency((courseData.originalPrice || courseData.price * 1.5) - courseData.price)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-4 border-t border-white/5">
                    <span className="text-white font-black uppercase tracking-widest text-[10px] mt-1.5">Total Amount</span>
                    <span className="text-2xl font-black text-white tracking-tighter">{formatCurrency(courseData.price)}</span>
                  </div>
                </div>

                {/* Features (Mini) */}
                <div className="pt-4 border-t border-white/5 relative z-10">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">You'll Get Immediate Access to:</h4>
                  <ul className="space-y-3">
                    {(courseData.features || ['Full Course Access']).slice(0, 4).map((f: any, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-gray-400">
                        <FiCheck className="h-3.5 w-3.5 text-emerald-500 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-4 hidden lg:block">
                  <Button
                    type="submit"
                    className="w-full"
                    variant="primary"
                    size="lg"
                    loading={isProcessing}
                    disabled={isProcessing}
                    onClick={() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }}
                  >
                    {isProcessing ? 'Redirecting to Payment...' : `Secure Checkout - ${formatCurrency(courseData.price)}`}
                  </Button>
                  <p className="text-[10px] text-gray-600 text-center mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <FiLock className="h-2.5 w-2.5" />
                    Secure Hosted Payment Gateway
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

CheckoutPage.allowedRoles = ['student', 'instructor', 'admin'];
export default CheckoutPage;
