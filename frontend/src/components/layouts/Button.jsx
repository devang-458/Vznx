import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center'; // Added flex, items-center, justify-center

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-[#EA580C] focus:ring-primary shadow-sm',
    secondary: 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 focus:ring-zinc-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-500',
    ghost: 'text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? disabledStyles : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;