import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for authentication form handling
 * Manages form state, validation, and server communication
 */
export const useAuthForm = (onSuccess) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({});

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (
    submitFn,
    validateFn,
    requiredFields = []
  ) => {
    return async (e) => {
      e.preventDefault();
      
      // Check required fields
      const newErrors = {};
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = `${field} is required`;
        }
      });
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Validate data
      if (validateFn) {
        const validationResult = await validateFn(formData);
        if (!validationResult.success) {
          setErrors(validationResult.errors || {});
          return;
        }
      }

      setIsLoading(true);
      setErrors({});

      try {
        const result = await submitFn(formData);
        toast.success('Success!', {
          position: 'top-right',
          autoClose: 3000,
        });
        onSuccess?.(result);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        const errorData = error.response?.data?.errors || {};

        if (Object.keys(errorData).length > 0) {
          setErrors(errorData);
        } else {
          setErrors({ form: errorMessage });
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 3000,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
  }, [formData, errors, onSuccess]);

  const resetForm = useCallback(() => {
    setFormData({});
    setErrors({});
    setShowPassword(false);
  }, []);

  return {
    formData,
    errors,
    isLoading,
    showPassword,
    setShowPassword,
    handleFieldChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors
  };
};

/**
 * Custom hook for keyboard navigation in auth forms
 */
export const useAuthKeyboard = (formRef) => {
  const handleKeyDown = useCallback((e) => {
    if (!formRef?.current) return;

    const inputs = formRef.current.querySelectorAll('input, button[type="submit"]');
    const inputArray = Array.from(inputs);
    const currentIndex = inputArray.indexOf(document.activeElement);

    if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
      e.preventDefault();
      if (currentIndex < inputArray.length - 1) {
        inputArray[currentIndex + 1]?.focus();
      } else {
        inputArray[inputArray.length - 1]?.click();
      }
    }

    if (e.key === 'Shift' && e.key === 'Tab') {
      e.preventDefault();
      if (currentIndex > 0) {
        inputArray[currentIndex - 1]?.focus();
      }
    }
  }, [formRef]);

  return { handleKeyDown };
};
