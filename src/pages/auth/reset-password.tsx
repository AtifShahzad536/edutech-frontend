import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import PublicLayout from '@/components/layout/PublicLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSuccess(true);
    setIsLoading(false);
  };

  const passwordStrength = (password: string) => {
    if (password.length < 8) return { strength: 'weak', color: 'text-red-500' };
    if (password.length < 12) return { strength: 'medium', color: 'text-yellow-500' };
    return { strength: 'strong', color: 'text-green-500' };
  };

  const strength = passwordStrength(password);

  if (isSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <FiCheck className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Password reset successful
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been successfully reset.
            </p>
            <div className="mt-6">
              <Button href="/auth/login" className="w-full">
                Continue to login
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Set new password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your new password must be different from previous used passwords.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="New password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startIcon={<FiLock className="h-5 w-5 text-gray-400" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                }
                placeholder="Enter new password"
              />
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password strength:</span>
                    <span className={strength.color}>{strength.strength}</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength.strength === 'weak' ? 'w-1/3 bg-red-500' :
                        strength.strength === 'medium' ? 'w-2/3 bg-yellow-500' :
                        'w-full bg-green-500'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Confirm new password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                startIcon={<FiLock className="h-5 w-5 text-gray-400" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                }
                placeholder="Confirm new password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={!password || !confirmPassword || password !== confirmPassword}
              >
                Reset password
              </Button>
              
              <div className="text-center">
                <a
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-primary-600"
                >
                  Cancel
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ResetPasswordPage;
