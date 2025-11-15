import React, { useState, useContext, useEffect } from 'react'
import AdminLayout from '../../components/layouts/DashboardLayout'
import { UserContext } from '../../context/userContext'
import EnhancedInput from '../../components/EnhancedInput'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATHS } from '../../utils/apiPaths'
import { generatePlaceholders, suggestLabels, generatePrioritySuggestion, getAutoSaveMessage } from '../../utils/aiSuggestions'
import { LuWand2, LuLoader } from 'lucide-react'

const CreateTaskEnhanced = () => {
  const { user } = useContext(UserContext)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    labels: [],
    newLabel: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [labelSuggestions, setLabelSuggestions] = useState([])
  const [prioritySuggestion, setPrioritySuggestion] = useState('')
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [users, setUsers] = useState([])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS)
        setUsers(Array.isArray(response.data) ? response.data : response.data.users || [])
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }
    fetchUsers()
  }, [])

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formData.title || formData.description) {
        setAutoSaving(true)
        // Simulate auto-save to localStorage for draft
        localStorage.setItem('taskDraft', JSON.stringify(formData))
        setLastSaved(getAutoSaveMessage(new Date()))
        setAutoSaving(false)
      }
    }, 2000)

    return () => clearTimeout(autoSaveTimer)
  }, [formData])

  // Generate suggestions as user types
  useEffect(() => {
    const suggestions = suggestLabels(formData.title, formData.description)
    setLabelSuggestions(suggestions)

    if (formData.dueDate) {
      const priority = generatePrioritySuggestion(formData.dueDate, formData.title, formData.description)
      setPrioritySuggestion(priority)
    }
  }, [formData.title, formData.description, formData.dueDate])

  const handleChange = (field) => (e) => {
    const value = e.target ? e.target.value : e
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddLabel = (label) => {
    if (!formData.labels.includes(label) && label.trim()) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, label],
        newLabel: ''
      }))
    }
  }

  const handleRemoveLabel = (index) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index)
    }))
  }

  const handleAcceptSuggestion = (type, value) => {
    if (type === 'priority') {
      setFormData(prev => ({ ...prev, priority: value }))
    } else if (type === 'label') {
      handleAddLabel(value)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        labels: formData.labels,
        createdBy: user._id
      }

      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload)
      
      // Clear localStorage draft on success
      localStorage.removeItem('taskDraft')
      
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        labels: [],
        newLabel: ''
      })
      alert('Task created successfully!')
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create task' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Create New Task</h1>
        <p className="text-gray-600 mb-8">Intelligent task creation with AI-powered suggestions</p>

        {errors.submit && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title with AI suggestions */}
          <EnhancedInput
            label="Task Title"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder={generatePlaceholders('taskTitle')[0]}
            error={errors.title}
            autoSave={true}
            isSaving={autoSaving}
            lastSaved={lastSaved}
            currentRole={user?.role || 'member'}
            visibleFor={['admin', 'member']}
          />

          {/* Description with auto-resizing */}
          <EnhancedInput
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder={generatePlaceholders('taskDescription')[0]}
            error={errors.description}
            autoSave={true}
            isSaving={autoSaving}
            lastSaved={lastSaved}
            currentRole={user?.role || 'member'}
            visibleFor={['admin', 'member']}
          />

          {/* Priority with suggestion */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              {prioritySuggestion && prioritySuggestion !== formData.priority && (
                <button
                  type="button"
                  onClick={() => handleAcceptSuggestion('priority', prioritySuggestion)}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center"
                >
                  <LuWand2 size={14} className="mr-1" /> Suggest: {prioritySuggestion}
                </button>
              )}
            </div>
            <select
              value={formData.priority}
              onChange={handleChange('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={handleChange('dueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
          </div>

          {/* Labels with AI suggestions */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Labels</label>
              {labelSuggestions.length > 0 && (
                <div className="text-xs space-y-1">
                  {labelSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAcceptSuggestion('label', suggestion)}
                      className="block bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 text-xs"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.newLabel}
                onChange={handleChange('newLabel')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddLabel(formData.newLabel)
                  }
                }}
                placeholder="Add a label and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddLabel(formData.newLabel)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Add
              </button>
            </div>

            {/* Display labels */}
            <div className="flex flex-wrap gap-2">
              {formData.labels.map((label, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(idx)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading && <LuLoader className="animate-spin" size={20} />}
            {loading ? 'Creating Task...' : 'Create Task'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}

export default CreateTaskEnhanced
