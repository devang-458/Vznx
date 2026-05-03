import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enterprise submit button with loading state and accessibility
 */
export const SubmitButton = ({
  isLoading = false,
  disabled = false,
  children,
  type = 'submit',
  variant = 'primary',
  fullWidth = true,
  className = '',
  ariaLabel,
  onClick,
  ...rest
}) => {
  const baseClasses = 'relative font-medium text-base rounded-lg px-6 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-[#EA580C] focus:ring-primary active:scale-95',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  return (
    <motion.button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      whileHover={{ scale: isLoading || disabled ? 1 : 1.02 }}
      whileTap={{ scale: isLoading || disabled ? 1 : 0.98 }}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${className}
      `}
      {...rest}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        <span className={isLoading ? 'opacity-0' : 'opacity-100'} aria-hidden={isLoading}>
          {children}
        </span>
        {isLoading && <span className="absolute opacity-0">Loading...</span>}
      </div>
    </motion.button>
  );
};

/**
 * Auth divider with text
 */
export const AuthDivider = ({ text = 'OR' }) => (
  <div className="flex items-center gap-4 my-6">
    <div className="flex-1 border-t border-slate-300"></div>
    <span className="text-sm text-slate-500 font-medium">{text}</span>
    <div className="flex-1 border-t border-slate-300"></div>
  </div>
);

/**
 * Link button for auth flow navigation
 */
export const AuthLink = ({ href, children, className = '', ...rest }) => (
  <a
    href={href}
    className={`
      text-primary hover:text-orange-700 font-medium text-sm
      underline hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-1
      transition-colors duration-200
      ${className}
    `}
    {...rest}
  >
    {children}
  </a>
);

/**
 * Auth form container for consistent styling
 */
export const AuthFormContainer = ({ children, onSubmit, className = '', ...rest }) => (
  <form
    onSubmit={onSubmit}
    noValidate
    className={`space-y-4 ${className}`}
    {...rest}
  >
    {children}
  </form>
);

/**
 * Checkbox with accessibility support
 */
export const AuthCheckbox = ({
  id,
  label,
  checked = false,
  onChange,
  error,
  disabled = false,
  ...rest
}) => (
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="w-5 h-5 rounded border-2 border-slate-300 focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={label}
      {...rest}
    />
    <motion.label
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      htmlFor={id}
      className={`text-sm font-medium cursor-pointer select-none ${
        error ? 'text-red-600' : 'text-slate-700'
      }`}
    >
      {label}
    </motion.label>
  </div>
);

/**
 * Success message display
 */
export const SuccessMessage = ({ message, icon = '✓' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
    role="status"
    aria-label="Success"
  >
    <span className="text-2xl">{icon}</span>
    <div>
      <p className="text-sm font-semibold text-green-900">{message}</p>
    </div>
  </motion.div>
);

/**
 * Info message display
 */
export const InfoMessage = ({ message, icon = 'ℹ' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3"
    role="status"
  >
    <span className="text-2xl">{icon}</span>
    <p className="text-sm font-medium text-orange-900">{message}</p>
  </motion.div>
);
