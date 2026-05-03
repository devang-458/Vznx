import React, { useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, KeyRound, Upload } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import FormField from '../../components/Auth/FormField';
import { SubmitButton, AuthFormContainer, SuccessMessage } from '../../components/Auth/AuthComponents';
import { signupSchema } from '../../validation/authSchemas';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import uploadImage from '../../utils/uploadImage';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [profileImage, setProfileImage] = React.useState(null);
  const [profilePreview, setProfilePreview] = React.useState(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      adminInviteToken: '',
    },
  });

  const password = watch('password');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      let profileImageUrl = '';

      // Upload image if selected
      if (profileImage) {
        setUploadingImage(true);
        try {
          const imgUploadRes = await uploadImage(profileImage);
          profileImageUrl = imgUploadRes.imageUrl || '';
        } catch (imgError) {
          console.error('Image upload error:', imgError);
          toast.warn('Profile image upload failed, but account creation will continue', {
            position: 'top-right',
            autoClose: 3000,
          });
        } finally {
          setUploadingImage(false);
        }
      }

      // Create account
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: data.fullName,
        email: data.email,
        password: data.password,
        profileImageUrl,
        adminInviteToken: data.adminInviteToken || undefined,
      });

      const { token } = response.data;

      // Show success message
      setSuccessMessage('Account created successfully! Redirecting to login...');

      // Store token temporarily
      if (token) {
        localStorage.setItem('token', token);
        updateUser({
          token: response.data.token,
          ...response.data.user,
        });
      }

      toast.success('Welcome! Creating your account...', {
        position: 'top-right',
        autoClose: 2000,
      });

      // Redirect to dashboard or login
      setTimeout(() => {
        navigate(response.data.user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
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
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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
            Create Account
          </h1>
          <p className="text-slate-600 text-sm">
            Join us today and start managing your tasks efficiently
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div variants={itemVariants}>
            <SuccessMessage message={successMessage} />
          </motion.div>
        )}

        {/* Form */}
        <motion.div variants={itemVariants}>
          <AuthFormContainer
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Profile Picture Upload */}
            <motion.div variants={itemVariants} className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || isSubmitting}
                  className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                  aria-label="Upload profile picture"
                >
                  <Upload />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                  aria-label="Profile image input"
                />
              </div>
            </motion.div>

            {/* Full Name */}
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  icon={User}
                  error={errors.fullName?.message}
                  disabled={isSubmitting}
                  autoComplete="name"
                  ariaLabel="Full name"
                  required
                  {...field}
                />
              )}
            />

            {/* Email */}
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
                  ariaLabel="Email address"
                  required
                  {...field}
                />
              )}
            />

            {/* Password */}
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
                  autoComplete="new-password"
                  ariaLabel="Password"
                  hint="Min 8 chars, uppercase, lowercase, number, special char"
                  required
                  {...field}
                />
              )}
            />

            {/* Confirm Password */}
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
                  ariaLabel="Confirm password"
                  required
                  {...field}
                />
              )}
            />

            {/* Admin Invite Token (Optional) */}
            <Controller
              name="adminInviteToken"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Admin Invite Token (Optional)"
                  type="text"
                  placeholder="000000"
                  icon={KeyRound}
                  error={errors.adminInviteToken?.message}
                  disabled={isSubmitting}
                  inputMode="numeric"
                  maxLength="6"
                  ariaLabel="Admin invite token"
                  hint="If you have an admin token, enter your 6-digit code here"
                  {...field}
                />
              )}
            />

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <SubmitButton
                isLoading={isSubmitting || uploadingImage}
                disabled={isSubmitting || uploadingImage}
                aria-label="Create account"
              >
                {isSubmitting || uploadingImage ? 'Creating account...' : 'Create Account'}
              </SubmitButton>
            </motion.div>
          </AuthFormContainer>
        </motion.div>

        {/* Login Link */}
        <motion.div
          variants={itemVariants}
          className="text-center pt-4 border-t border-slate-200"
        >
          <p className="text-sm text-slate-700">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};

export default Signup;
