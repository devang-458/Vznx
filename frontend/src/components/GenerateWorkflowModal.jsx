import React, { useState } from 'react';
import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPaths';
import Button from './layouts/Button';
import { LuX, LuLoader } from 'react-icons/lu';
import { AnimatePresence, motion } from 'framer-motion';

const GenerateWorkflowModal = ({ isOpen, onClose, onSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      setError('Please enter a project concept.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(API_PATHS.PROJECTS.GENERATE_WORKFLOW, {
        userPrompt: prompt,
      });
      onSuccess(response.data); // Pass the new project data back
      setPrompt('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate workflow. Please try again.');
      console.error('Error generating workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={onClose}
            >
              <LuX className="text-gray-500" />
            </Button>

            <h3 className="text-xl font-semibold text-gray-800">✨ AI Workflow Generator</h3>
            <p className="text-sm text-gray-500 mt-2">
              Describe your architectural project concept, and our AI will generate a complete workflow with industry-specific tasks.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col">
                <label htmlFor="prompt" className="text-sm font-medium text-gray-700 mb-2">
                  Project Concept
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'A modern, sustainable residential home with 3 bedrooms'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  rows="3"
                />
              </div>

              {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

              <div className="flex justify-end items-center gap-4 mt-6">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <LuLoader className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Workflow'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerateWorkflowModal;
