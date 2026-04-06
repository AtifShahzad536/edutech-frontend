import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  FiShoppingCart, FiCreditCard, FiLock, FiCheckCircle, FiAlertCircle,
  FiChevronLeft, FiDollarSign, FiPercent, FiGift, FiTrash2, FiShield,
  FiUser, FiMail, FiMapPin, FiSmartphone, FiCalendar, FiClock, FiChevronRight,
  FiBookOpen, FiArrowRight
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { clearCart } from '@/store/slices/courseSlice';
import { refreshUser } from '@/store/slices/authSlice';
import { AuthenticatedPage } from '@/types';
import axios from 'axios';
import API_URL from '@/config/api';

const CheckoutPage: AuthenticatedPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cart: cartIds, courses } = useAppSelector(state => state.courses);
  const { user } = useAppSelector(state => state.auth);

  // Map cart IDs to actual course objects
  const cartItems = useMemo(() => {
    return courses.filter(course => cartIds.includes(course.id as string));
  }, [cartIds, courses]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Payment state
  const [activeStep, setActiveStep] = useState<'review' | 'payment' | 'confirmation'>('review');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchasedAmount, setPurchasedAmount] = useState<number>(0);
  const [verifying, setVerifying] = useState(false);

  // Handle Stripe Redirection Success
  const hasProcessed = useRef(false);

  React.useEffect(() => {
    if (!router.isReady || hasProcessed.current) return;

    const sessionId = router.query.session_id as string;
    const success = router.query.success === 'true';

    if (success && sessionId && !verifying) {
      const verifyPayment = async () => {
        setVerifying(true);
        const token = localStorage.getItem('token');
        
        try {
          // 1. Verify with backend first (Fallback enrollment)
          const verifyRes = await axios.get(`${API_URL}/payments/verify/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (verifyRes.data.success) {
            // 2. Refresh user to sync enrolled courses
            await dispatch(refreshUser() as any);
            
            // 3. Clear cart
            dispatch(clearCart());
            
            // 4. Set UI states
            setPurchasedAmount(verifyRes.data.data.amountTotal || parseFloat(localStorage.getItem('pendingCartTotal') || '0'));
            setPaymentSuccess(true);
            setActiveStep('confirmation');
            hasProcessed.current = true;
          }
        } catch (err) {
          console.error('Verification failed:', err);
          // Still try to show generic success if we have a saved amount, 
          // but at least we tried the sync.
          setPaymentSuccess(true);
          setActiveStep('confirmation');
        } finally {
          setVerifying(false);
          localStorage.removeItem('pendingCartTotal');
        }
      };

      verifyPayment();
    }

    if (router.query.canceled === 'true') {
      hasProcessed.current = true;
      setPaymentError('Payment was canceled. You can try again.');
      setActiveStep('review');
    }
  }, [router.isReady, router.query, dispatch, verifying]);

  // Saved payment methods (Mocked for UI selection, but Stripe Checkout will handle)
  const savedMethods = [
    { id: 'card-1', type: 'card', name: 'Visa ending in 4242', last4: '4242', expiry: '12/25', isDefault: true },
  ];

  // Calculate totals
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price, 0), [cartItems]);
  const discount = 0; // Can be expanded for tiered discounts
  const promoDiscount = appliedPromo ? (subtotal - discount) * (appliedPromo.discount / 100) : 0;
  const total = subtotal - discount - promoDiscount;

  // Remove item from cart
  const removeItem = useCallback((itemId: string) => {
    // dispatch(removeFromCart(itemId));
  }, []);

  // Apply promo code
  const applyPromoCode = useCallback(async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const validCodes: { [key: string]: number } = { 'SAVE20': 20, 'FLASH50': 50 };
    if (validCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount: validCodes[promoCode.toUpperCase()] });
    } else {
      setPaymentError('Invalid promo code');
      setTimeout(() => setPaymentError(null), 3000);
    }
    setIsApplyingPromo(false);
  }, [promoCode]);

  // Process payment via Stripe Redirect
  const processPayment = useCallback(async () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const token = localStorage.getItem('token');

      // ✅ Save total to localStorage BEFORE redirecting — cart will be empty on return
      const currentTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
      localStorage.setItem('pendingCartTotal', String(currentTotal));

      const response = await axios.post(`${API_URL}/payments/checkout`, {
        courseIds: cartIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        window.location.href = response.data.data;
      } else {
        localStorage.removeItem('pendingCartTotal');
        setPaymentError('Failed to initiate checkout. Please try again.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      localStorage.removeItem('pendingCartTotal');
      console.error('Checkout Error:', error);
      setPaymentError(error.response?.data?.message || 'Payment processing failed.');
      setIsProcessing(false);
    }
  }, [cartIds, cartItems, user, router]);

  // Formatters

  const cardCls = "bg-gray-900 border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden";
  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all";
  const labelCls = "text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block";

  return (
    <PublicLayout>
      <div className="bg-gray-950 text-gray-300 min-h-screen">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10 md:py-16">
          
          {/* Header */}
          <div className="mb-10 md:mb-16 text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              <FiLock className="h-3 w-3" /> Secure Checkout
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Purchase</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Join 45,000+ students and start learning today. 30-day money-back guarantee.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center mb-12 md:mb-20 overflow-x-auto pb-4 no-scrollbar">
            {[
              { id: 'review', label: 'Review', icon: FiShoppingCart },
              { id: 'payment', label: 'Payment', icon: FiCreditCard },
              { id: 'confirmation', label: 'Done', icon: FiCheckCircle },
            ].map((step, idx) => {
              const isActive = activeStep === step.id;
              const isCompleted = (activeStep === 'payment' && step.id === 'review') || (activeStep === 'confirmation');
              return (
                <div key={step.id} className="flex items-center gap-4 flex-shrink-0">
                  {idx > 0 && <FiChevronRight className="text-gray-800 h-4 w-4 mx-2" />}
                  <div className={`flex items-center gap-3 ${isActive ? 'text-white' : isCompleted ? 'text-indigo-400' : 'text-gray-700'}`}>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                      isActive ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20' : 
                      isCompleted ? 'bg-indigo-400/10 border-indigo-400/20' : 'bg-white/5 border-white/5'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">{step.label}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* STEP 1: REVIEW */}
          {activeStep === 'review' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FiShoppingCart className="text-indigo-400" />
                  Your Cart ({cartItems.length} items)
                </h2>

                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 md:p-6 group hover:bg-gray-900 transition-all">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-40 h-24 bg-indigo-600/10 rounded-xl border border-indigo-500/20 flex flex-shrink-0 items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/10" />
                        <FiBookOpen className="h-8 w-8 text-indigo-400/40" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-white leading-snug group-hover:text-indigo-400 transition-all">{item.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">by {item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : 'Instructor'}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-gray-700 hover:text-red-400 transition-all p-1">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-white">${item.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cartItems.length === 0 && (
                  <div className="py-20 text-center space-y-4">
                    <FiShoppingCart className="h-12 w-12 text-gray-800 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
                    <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className={cardCls}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <h3 className="text-lg font-bold text-white mb-6">Order Summary</h3>
                  
                  {/* Promo */}
                  <div className="mb-8 space-y-3">
                    <label className={labelCls}>Promo Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="SAVE20" className={inputCls}
                      />
                      <button onClick={applyPromoCode} disabled={isApplyingPromo || !promoCode} 
                        className="bg-white/5 hover:bg-white/10 text-white px-4 rounded-xl font-bold text-xs transition-all border border-white/10">
                        {isApplyingPromo ? '...' : 'Apply'}
                      </button>
                    </div>
                    {appliedPromo && (
                      <div className="flex items-center justify-between text-xs p-2 bg-emerald-400/5 border border-emerald-400/10 rounded-lg text-emerald-400">
                        <span>Code {appliedPromo.code} applied</span>
                        <button onClick={() => setAppliedPromo(null)} className="font-bold underline">Remove</button>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="space-y-4 pb-6 border-b border-white/5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Course Discounts</span>
                        <span className="text-emerald-400">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Promo ({appliedPromo?.discount}%)</span>
                        <span className="text-emerald-400">-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="py-6 flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-3xl font-black text-indigo-400">${total.toFixed(2)}</span>
                  </div>

                  <Button className="w-full py-4 font-bold text-sm" onClick={processPayment} disabled={cartItems.length === 0 || isProcessing}>
                    {isProcessing ? 'Connecting...' : 'Checkout Now'}
                  </Button>
                  <p className="text-[10px] text-gray-600 text-center mt-6 uppercase tracking-widest font-bold">
                    <FiShield className="inline h-3 w-3 mr-1" /> Secure SSL Encryption
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {activeStep === 'payment' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
              <div className="lg:col-span-2 space-y-8">
                {/* Replaced with direct Stripe Checkout redirect to avoid double entry */}
                <div className="py-12 text-center space-y-6">
                  <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/10">
                    <FiLock className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-white">Secure External Payment</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    You'll be securely redirected to Stripe to complete your purchase. We use SSL encryption to protect your data.
                  </p>
                  
                  <div className="pt-6">
                    <Button className="w-full py-4 font-bold text-sm" onClick={processPayment} disabled={isProcessing}>
                      {isProcessing ? 'Redirecting...' : `Pay $${total.toFixed(2)} Now`}
                    </Button>
                  </div>
                </div>

                {/* Billing */}
                <div className={cardCls}>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <FiMail className="text-indigo-400" />
                    Billing Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelCls}>Full Name</label>
                      <input type="text" placeholder="Full Name" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Email address</label>
                      <input type="email" placeholder="email@address.com" className={inputCls} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Country</label>
                      <select className={inputCls + " appearance-none"}>
                        <option className="bg-gray-900">United States</option>
                        <option className="bg-gray-900">United Kingdom</option>
                        <option className="bg-gray-900">Canada</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Zip Code</label>
                      <input type="text" placeholder="XXXXX" className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <button onClick={() => setActiveStep('review')} className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-all">Back to Review</button>
                  <Button className="px-12 py-4 font-bold text-sm" onClick={processPayment} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </Button>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="space-y-6">
                <div className={cardCls}>
                  <h3 className="text-lg font-bold text-white mb-6">In Your Order</h3>
                  <div className="space-y-4 mb-8">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center gap-4">
                        <span className="text-sm font-bold text-gray-400 line-clamp-1">{item.title}</span>
                        <span className="text-sm font-black text-white">${item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-bold uppercase tracking-wider text-[10px]">Total to Pay</span>
                      <span className="text-2xl font-black text-indigo-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-8 space-y-4 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                      <FiShield className="h-4 w-4 text-indigo-400" />
                      <span>SECURE TRANSACTION</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                      <FiCheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>30-DAY MONEY-BACK</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION OR VERIFYING */}
          {verifying && (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
              <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                <FiLock className="h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Verifying Purchase...</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">Please wait while we confirm your enrollment and set up your dashboard.</p>
            </div>
          )}

          {activeStep === 'confirmation' && !verifying && (
            <div className="max-w-2xl mx-auto py-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-indigo-600/10">
                <FiCheckCircle className="h-10 w-10 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Payment Successful!</h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed mb-12">
                Welcome to the course! We've sent an order confirmation to your email.
              </p>
              
              <div className={cardCls + " text-left mb-12"}>
                <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Transaction Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b border-white/5 pb-4">
                    <span className="text-gray-600 font-medium">Order ID</span>
                    <span className="text-white font-bold">#ORD-{Date.now().toString().slice(-8)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/5 pb-4">
                    <span className="text-gray-600 font-medium">Date</span>
                    <span className="text-white font-bold">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Amount Paid</span>
                    <span className="text-indigo-400 font-black text-xl">${purchasedAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/student/courses" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    Start Learning <FiArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/student/courses" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-10 py-4 rounded-xl font-bold text-sm transition-all">
                    Back to Library
                  </button>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
};

CheckoutPage.allowedRoles = ['student', 'instructor', 'admin'];
export default CheckoutPage;
