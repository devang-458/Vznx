import React, { useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import FormField from '../../components/Auth/FormField';
import { SubmitButton, AuthCheckbox, AuthLink, AuthFormContainer, InfoMessage } from '../../components/Auth/AuthComponents';
import { loginSchema } from '../../validation/authSchemas';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  const formRef = useRef(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setInfoMessage(null);
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: data.email,
        password: data.password,
      });

      const { token, role } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      if (data.rememberMe) {
        localStorage.setItem('rememberEmail', data.email);
      }

      // Update user context
      updateUser(response.data);

      // Show success toast
      toast.success('Welcome back! Redirecting...', {
        position: 'top-right',
        autoClose: 2000,
      });

      // Redirect based on role
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      }, 500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setInfoMessage({
        type: 'error',
        message: errorMessage,
      });
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <AuthLayout variant="premium-split">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600 text-sm">
            Sign in to your account to continue managing your tasks
          </p>
        </motion.div>

        {/* Info/Error Message */}
        {infoMessage && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {infoMessage.type === 'error' ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900">{infoMessage.message}</p>
              </div>
            ) : (
              <InfoMessage message={infoMessage.message} />
            )}
          </motion.div>
        )}

        {/* Form */}
        <motion.div variants={itemVariants}>
          <AuthFormContainer
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Email Field */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={Mail}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                  autoComplete="email"
                  inputMode="email"
                  ariaLabel="Email address for login"
                  {...field}
                />
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  showPassword={showPassword}
                  onPasswordToggle={setShowPassword}
                  autoComplete="current-password"
                  ariaLabel="Password for login"
                  {...field}
                />
              )}
            />

            {/* Remember Me & Forgot Password */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between pt-2"
            >
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <AuthCheckbox
                    id="rememberMe"
                    label="Remember me"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <SubmitButton
                isLoading={isSubmitting}
                disabled={isSubmitting}
                aria-label="Sign in to account"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </SubmitButton>
            </motion.div>
          </AuthFormContainer>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          variants={itemVariants}
          className="text-center pt-4 border-t border-slate-200"
        >
          <p className="text-sm text-slate-700">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
