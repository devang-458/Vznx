import React, { useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import FormField from '../../components/Auth/FormField';
import { SubmitButton, AuthFormContainer, SuccessMessage, InfoMessage } from '../../components/Auth/AuthComponents';
import { resetPasswordSchema } from '../../validation/authSchemas';
import axiosInstance from '../../utils/axiosinstance';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const formRef = useRef(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [infoMessage, setInfoMessage] = React.useState(null);
  const [isValidToken, setIsValidToken] = React.useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      token: token || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setInfoMessage({
        type: 'error',
        message: 'Invalid reset link. Please request a new password reset.',
      });
      return;
    }

    // Optional: Verify token with backend
    const verifyToken = async () => {
      try {
        await axiosInstance.post('/api/auth/verify-reset-token', { token });
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        setInfoMessage({
          type: 'error',
          message: 'This reset link has expired. Please request a new one.',
        });
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data) => {
    try {
      setSuccessMessage(null);
      setInfoMessage(null);

      const response = await axiosInstance.post('/api/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      });

      setSuccessMessage('Your password has been successfully reset! Redirecting to login...');

      toast.success('Password reset successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });

      reset();

      // Redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
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

  if (isValidToken === false) {
    return (
      <AuthLayout variant="premium-split">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 flex flex-col items-center justify-center min-h-[400px]"
        >
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <div className="text-5xl mb-4">⏰</div>
            <h1 className="text-3xl font-bold text-slate-900">Link Expired</h1>
            <p className="text-slate-600">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <Link
              to="/forgot-password"
              className="text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Request New Reset Link
            </Link>
            <Link
              to="/login"
              className="text-center text-blue-600 hover:text-blue-700 font-medium py-3"
            >
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </AuthLayout>
    );
  }

  if (isValidToken === null) {
    return (
      <AuthLayout variant="premium-split">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 flex flex-col items-center justify-center min-h-[400px]"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </motion.div>
          <p className="text-slate-600">Verifying your reset link...</p>
        </motion.div>
      </AuthLayout>
    );
  }

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
            Create New Password
          </h1>
          <p className="text-slate-600 text-sm">
            Enter a strong password for your account
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <SuccessMessage message={successMessage} />
          </motion.div>
        )}

        {/* Error Message */}
        {infoMessage && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900">{infoMessage.message}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        {!successMessage && (
          <motion.div variants={itemVariants}>
            <AuthFormContainer
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* New Password Field */}
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    error={errors.newPassword?.message}
                    disabled={isSubmitting}
                    showPassword={showPassword}
                    onPasswordToggle={setShowPassword}
                    autoComplete="new-password"
                    ariaLabel="New password"
                    hint="Min 8 chars, uppercase, lowercase, number, special char"
                    required
                    {...field}
                  />
                )}
              />

              {/* Confirm Password Field */}
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    error={errors.confirmPassword?.message}
                    disabled={isSubmitting}
                    showPassword={showConfirmPassword}
                    onPasswordToggle={setShowConfirmPassword}
                    autoComplete="new-password"
                    ariaLabel="Confirm new password"
                    required
                    {...field}
                  />
                )}
              />

              {/* Info box */}
              <motion.div
                variants={itemVariants}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="text-xs text-green-900">
                  ✓ Make sure your password is strong and unique. Avoid using personal information.
                </p>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <SubmitButton
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  aria-label="Reset password"
                >
                  {isSubmitting ? 'Resetting password...' : 'Reset Password'}
                </SubmitButton>
              </motion.div>
            </AuthFormContainer>
          </motion.div>
        )}

        {/* Back to Login Link */}
        <motion.div
          variants={itemVariants}
          className="text-center pt-4 border-t border-slate-200"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPassword;
