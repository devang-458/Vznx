import React, { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import FormField from '../../components/Auth/FormField';
import { SubmitButton, AuthFormContainer, SuccessMessage, InfoMessage } from '../../components/Auth/AuthComponents';
import { forgotPasswordSchema } from '../../validation/authSchemas';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [infoMessage, setInfoMessage] = React.useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSuccessMessage(null);
      setInfoMessage(null);

      const response = await axiosInstance.post('/api/auth/forgot-password', {
        email: data.email,
      });

      setSuccessMessage(
        `Password reset link has been sent to ${data.email}. Check your email for instructions.`
      );

      toast.success('Email sent successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      reset();

      // Optionally redirect after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
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
            Reset Password
          </h1>
          <p className="text-slate-600 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <SuccessMessage message={successMessage} icon="📧" />
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
                    ariaLabel="Email address to reset password"
                    required
                    {...field}
                  />
                )}
              />

              {/* Info box */}
              <motion.div
                variants={itemVariants}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-xs text-blue-900">
                  💡 We'll send a password reset link to your email. The link will be valid for 24 hours.
                </p>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <SubmitButton
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  aria-label="Send password reset link"
                >
                  {isSubmitting ? 'Sending link...' : 'Send Reset Link'}
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

export default ForgotPassword;
