import React, { useState, useEffect } from 'react'
import { LuCheck, LuAlertCircle } from 'lucide-react'

const EnhancedInput = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  error,
  suggestions = [],
  onSuggestionAccept,
  autoSave = false,
  isSaving = false,
  lastSaved,
  minHeight = 'auto',
  maxHeight = 'auto',
  visibleFor = ['admin', 'member'], // role-based visibility
  currentRole = 'member'
}) => {
  const [focused, setFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [height, setHeight] = useState(minHeight)

  // Auto-resize textarea
  const handleInput = (e) => {
    onChange(e)
    if (type === 'textarea') {
      e.target.style.height = 'auto'
      const newHeight = Math.min(Math.max(e.target.scrollHeight, 100), 400)
      setHeight(`${newHeight}px`)
    }
  }

  // Check role visibility
  if (!visibleFor.includes(currentRole)) {
    return null
  }

  if (type === 'textarea') {
    return (
      <div className="mb-4">
        {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <div className="relative">
          <textarea
            value={value}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              onBlur?.()
            }}
            placeholder={placeholder}
            style={{ height, maxHeight }}
            className={`w-full px-3 py-2 border rounded-md resize-none focus:outline-none transition-all ${
              error ? 'border-red-500 focus:ring-2 focus:ring-red-500' :
              focused ? 'border-blue-500 focus:ring-2 focus:ring-blue-500' :
              'border-gray-300 focus:ring-2 focus:ring-blue-400'
            }`}
          />
          {error && <LuAlertCircle className="absolute right-3 top-3 text-red-500" size={20} />}
          {isSaving && <div className="absolute right-3 top-3 animate-spin text-blue-500">‚ü≥</div>}
          {autoSave && lastSaved && !isSaving && (
            <div className="absolute right-3 top-3 flex items-center text-xs text-green-600">
              <LuCheck size={16} className="mr-1" /> {lastSaved}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleInput}
          onFocus={() => {
            setFocused(true)
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
          onBlur={() => {
            setFocused(false)
            setTimeout(() => setShowSuggestions(false), 200)
            onBlur?.()
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none transition-all ${
            error ? 'border-red-500 focus:ring-2 focus:ring-red-500' :
            focused ? 'border-blue-500 focus:ring-2 focus:ring-blue-500' :
            'border-gray-300 focus:ring-2 focus:ring-blue-400'
          }`}
        />
        <div className="absolute right-3 top-2 flex items-center gap-2">
          {error && <LuAlertCircle className="text-red-500" size={20} />}
          {isSaving && <div className="animate-spin text-blue-500">‚ü≥</div>}
          {autoSave && lastSaved && !isSaving && (
            <div className="flex items-center text-xs text-green-600">
              <LuCheck size={16} className="mr-1" /> {lastSaved}
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && focused && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSuggestionAccept?.(suggestion)
                  setShowSuggestions(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-gray-700 border-b last:border-b-0"
              >
                Ì≤° {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default EnhancedInput
