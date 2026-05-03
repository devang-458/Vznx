import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Enterprise-grade form field component with:
 * - Floating labels
 * - Password visibility toggle
 * - Inline error display
 * - Loading state
 * - Full accessibility
 */
const FormField = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  disabled = false,
  loading = false,
  hint,
  required = false,
  icon: Icon,
  onPasswordToggle,
  showPassword = false,
  value = '',
  onChange,
  onBlur,
  onKeyDown,
  className = '',
  autoComplete,
  ariaLabel,
  ariaDescribedBy,
  inputMode,
  pattern,
  maxLength,
  minLength,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const isPasswordType = type === 'password';
  const hasValue = value !== '';
  const hasError = !!error;
  const errorId = `${label}-error`;
  const hintId = `${label}-hint`;

  const inputType = isPasswordType && showPassword ? 'text' : type;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <div className="relative">
        {/* Floating Label */}
        <motion.label
          animate={{
            y: isFocused || hasValue ? -28 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: hasError ? '#ef4444' : isFocused ? '#f97316' : '#64748b'
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 pointer-events-none origin-left font-medium text-sm"
          htmlFor={label}
          id={`${label}-label`}
          aria-label={ariaLabel}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {/* Input Container */}
        <div className="relative mt-2">
          {/* Icon (optional) */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon size={18} />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={label}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            onFocus={handleFocus}
            disabled={disabled || loading}
            autoComplete={autoComplete}
            inputMode={inputMode}
            pattern={pattern}
            maxLength={maxLength}
            minLength={minLength}
            aria-label={ariaLabel || label}
            aria-describedby={hasError ? errorId : hint ? hintId : undefined}
            className={`
              w-full px-4 py-3 pl-${Icon ? '10' : '4'} rounded-lg
              border-2 transition-all duration-200
              font-medium text-base
              placeholder-slate-400
              focus:outline-none
              disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400
              ${Icon ? 'pl-12' : 'pl-4'}
              ${hasError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : isFocused
                ? 'border-primary bg-orange-50 focus:ring-2 focus:ring-orange-200 text-slate-900'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400 text-slate-900'
              }
              ${className}
            `}
            {...rest}
          />

          {/* Password Visibility Toggle */}
          {isPasswordType && (
            <motion.button
              type="button"
              onClick={() => onPasswordToggle?.(!showPassword)}
              disabled={disabled || loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          id={errorId}
          role="alert"
          className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium"
        >
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Hint Text */}
      {hint && !hasError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          id={hintId}
          className="mt-2 text-xs text-slate-500"
        >
          {hint}
        </motion.p>
      )}
    </motion.div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
