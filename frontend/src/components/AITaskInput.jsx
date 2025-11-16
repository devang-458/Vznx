import React, { useState } from 'react';
import Input from './Inputs/Input'; // Assuming a reusable Input component
import Button from './layouts/Button';
import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPaths';
import { toast } from 'react-toastify'; // Assuming react-toastify is used for notifications

const AITaskInput = ({ projectId, onIssueCreated }) => {
  const [textPrompt, setTextPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAIIssue = async () => {
    if (!textPrompt.trim()) {
      toast.error('Please enter a prompt for the AI task.');
      return;
    }
    if (!projectId) {
      toast.error('Project ID is missing. Cannot create AI task.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.ISSUES.AI_CREATE, {
        textPrompt,
        projectId,
      });

      const newIssue = response.data;
      toast.success(`AI created task: "${newIssue.title}"`);
      setTextPrompt(''); // Clear input

      if (onIssueCreated) {
        onIssueCreated(newIssue); // Notify parent component
      }
    } catch (error) {
      console.error('Error creating AI issue:', error);
      toast.error(error.response?.data?.message || 'Failed to create AI task.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleCreateAIIssue();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        value={textPrompt}
        onChange={(e) => setTextPrompt(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Describe your task for the AI (e.g., 'Fix login bug, high priority, assign to John')"
        className="flex-1"
        disabled={loading}
      />
      <Button
        onClick={handleCreateAIIssue}
        disabled={loading}
        variant="primary"
      >
        {loading ? 'Creating...' : 'AI Create'}
      </Button>
    </div>
  );
};

export default AITaskInput;
