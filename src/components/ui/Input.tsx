import React, { memo, forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = memo(forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, startIcon, endIcon, ...props }, ref) => {
    const inputClasses = useMemo(() => clsx(
      'w-full px-4 py-3 bg-white/[0.03] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-white placeholder-gray-600',
      {
        'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/50': !error,
        'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50': error,
        'pl-10': startIcon,
        'pr-10': endIcon,
      },
      className
    ), [error, startIcon, endIcon, className]);

    const renderStartIcon = useMemo(() => startIcon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {startIcon}
      </div>
    ), [startIcon]);

    const renderEndIcon = useMemo(() => endIcon && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        {endIcon}
      </div>
    ), [endIcon]);

    const renderError = useMemo(() => error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    ), [error]);

    const renderHelperText = useMemo(() => helperText && !error && (
      <p className="mt-2 text-xs text-gray-500 ml-1">{helperText}</p>
    ), [helperText, error]);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {renderStartIcon}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {renderEndIcon}
        </div>
        {renderError}
        {renderHelperText}
      </div>
    );
  }
));

Input.displayName = 'Input';

export default Input;
