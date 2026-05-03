import { z } from 'zod';

/**
 * Email validation schema - RFC 5322 compliant
 */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character (!@#$%^&*)');

/**
 * Full name validation
 */
const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(50, 'Full name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

/**
 * Admin invite token validation (6-digit code)
 */
const adminTokenSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^\d{6}$/.test(val),
    'Admin invite token must be exactly 6 digits'
  );

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Signup form schema
 */
export const signupSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  adminInviteToken: adminTokenSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Forgot password form schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password form schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Utility function to validate form data
 */
export const validateAuthForm = async (schema, data) => {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated, errors: null };
  } catch (error) {
    const errors = {};
    if (error.errors) {
      error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
    }
    return { success: false, data: null, errors };
  }
};
