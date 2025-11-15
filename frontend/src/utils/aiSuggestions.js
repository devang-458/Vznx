// AI-powered suggestions for task management

export const generatePlaceholders = (fieldType) => {
  const placeholders = {
    taskTitle: [
      "Complete project documentation...",
      "Review pull request...",
      "Schedule team meeting...",
      "Update database schema...",
      "Fix critical bug..."
    ],
    taskDescription: [
      "Add detailed steps to implement this feature...",
      "List acceptance criteria and requirements...",
      "Document expected outcomes and deliverables...",
      "Include relevant resources and references...",
      "Specify dependencies and blockers..."
    ],
    label: [
      "feature", "bug", "documentation", "refactor", "performance",
      "security", "testing", "ui/ux", "backend", "frontend"
    ]
  }
  return placeholders[fieldType] || []
}

export const suggestLabels = (taskTitle, taskDescription) => {
  const text = `${taskTitle} ${taskDescription}`.toLowerCase()
  const suggestions = []

  const keywords = {
    'feature': ['add', 'implement', 'create', 'new', 'feature'],
    'bug': ['fix', 'broken', 'error', 'crash', 'issue'],
    'documentation': ['doc', 'readme', 'wiki', 'guide', 'tutorial'],
    'refactor': ['refactor', 'clean', 'optimize', 'rewrite'],
    'performance': ['slow', 'optimize', 'performance', 'speed', 'memory'],
    'security': ['security', 'vulnerable', 'auth', 'permission', 'token'],
    'testing': ['test', 'unit', 'integration', 'e2e', 'coverage'],
    'ui/ux': ['ui', 'design', 'layout', 'component', 'style']
  }

  for (const [label, keywords_list] of Object.entries(keywords)) {
    if (keywords_list.some(kw => text.includes(kw))) {
      suggestions.push(label)
    }
  }

  return [...new Set(suggestions)].slice(0, 3)
}

export const generatePrioritySuggestion = (dueDate, taskTitle, taskDescription) => {
  const now = new Date()
  const due = new Date(dueDate)
  const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

  const urgentKeywords = ['urgent', 'critical', 'asap', 'immediately', 'blocking']
  const text = `${taskTitle} ${taskDescription}`.toLowerCase()
  const isUrgent = urgentKeywords.some(kw => text.includes(kw))

  if (isUrgent || daysUntilDue <= 1) return 'High'
  if (daysUntilDue <= 3) return 'Medium'
  return 'Low'
}

export const getAutoSaveMessage = (lastSavedTime) => {
  const now = new Date()
  const diff = Math.floor((now - lastSavedTime) / 1000)

  if (diff < 60) return `Saved ${diff}s ago`
  if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
  return `Saved ${Math.floor(diff / 3600)}h ago`
}
