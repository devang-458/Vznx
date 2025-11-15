# Quick Reference Guide - AI Task Manager

## 🎯 Start Here

### Access Points
| Feature | URL | Requires |
|---------|-----|----------|
| Admin Dashboard | http://localhost:5174/admin/dashboard | Admin role |
| AI Dashboard | http://localhost:5174/admin/ai-dashboard | Admin role |
| Task Insights | http://localhost:5174/admin/insights | Admin role |
| Create Task (Enhanced) | http://localhost:5174/admin/create-task | Admin role |
| Bulk Operations | http://localhost:5174/admin/bulk-operations | Admin role |
| User Dashboard | http://localhost:5174/user/dashboard | User role |
| My Tasks | http://localhost:5174/user/tasks | User role |

### Default Login Credentials (if available)
```
Admin:
  Email: admin@taskmanager.com
  Password: (check backend config)

User:
  Email: user@taskmanager.com
  Password: (check backend config)
```

---

## 🧠 AI Dashboard Quick Guide

### What's on the Dashboard?
1. **4 Insight Cards** (Top)
   - Team Velocity: Completion percentage
   - Priority Distribution: Task breakdown
   - Overdue Tasks: Count with warnings
   - Current Workload: Active task count

2. **Predictions** (Middle Left)
   - When will we finish all tasks?
   - Any bottlenecks detected?
   - Team utilization rate?

3. **Anomalies** (Middle Right)
   - Tasks with too much description?
   - Stale/inactive tasks?
   - Workload imbalance?

4. **Recommendations** (Bottom)
   - Focus on high-priority work
   - Address overdue tasks
   - Improve completion rate
   - Balance team workload

5. **Performance Chart** (Bottom)
   - Task trends over time
   - Completed vs In Progress vs Pending

---

## 🛠️ Component Reference

### Enhanced Input Component
```jsx
<EnhancedInput
  label="Task Title"
  value={title}
  onChange={handleTitleChange}
  placeholder="Enter task title..."
  suggestions={labelSuggestions}
  onSuggestionAccept={handleSuggestion}
  autoSave={true}
  isSaving={saving}
  lastSaved={saveTime}
  error={error}
/>
```

### Key Features:
- Auto-saves after 2 seconds
- Shows "Saved 5s ago" indicator
- Displays suggestions with 💡 icon
- Red border on error, clears when typing
- Works in enhanced task creation page

---

## 📱 Menu Navigation

### Admin Sidebar
```
📊 Dashboard → /admin/dashboard
📋 Manage Tasks → /admin/tasks
➕ Create Task → /admin/create-task
📈 Task Insights → /admin/insights
⚡ Bulk Operations → /admin/bulk-operations
👥 Team Members → /admin/users
🧠 AI Dashboard → /admin/ai-dashboard (NEW!)
🚪 Logout
```

### User Sidebar
```
📊 Dashboard → /user/dashboard
📋 Manage Tasks → /user/tasks
➕ Create Task → /user/create-task
👥 Team Members → /user/users
🧠 AI Dashboard → /user/ai-dashboard
🚪 Logout
```

---

## 🚀 API Endpoints Reference

### Tasks
```
GET    /api/tasks              - Get all tasks
POST   /api/tasks              - Create task
GET    /api/tasks/:id          - Get task details
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
PATCH  /api/tasks/bulk/:action - Bulk operations
```

### Analytics
```
GET /api/analytics/team-overview  - Team statistics
GET /api/analytics/completion     - Completion metrics
GET /api/analytics/trends         - Historical trends
```

### Users
```
GET    /api/users              - Get all users
POST   /api/users              - Create user
GET    /api/users/:id          - Get user details
PUT    /api/users/:id          - Update user
```

### Authentication
```
POST /api/auth/login            - User login
POST /api/auth/signup           - User registration
POST /api/auth/logout           - User logout
GET  /api/auth/verify           - Verify token
```

---

## 💾 Data Structure

### Task Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete project",
  "description": "Finish the task management system",
  "priority": "High",
  "status": "In Progress",
  "dueDate": "2024-11-20",
  "assignedTo": "user_id",
  "labels": ["urgent", "backend"],
  "createdAt": "2024-11-14T10:30:00Z",
  "updatedAt": "2024-11-14T15:45:00Z"
}
```

### Insight Object
```json
{
  "teamVelocity": 65,
  "priorityDistribution": {
    "High": 5,
    "Medium": 10,
    "Low": 8
  },
  "overdueCount": 2,
  "workloadCurrent": 7
}
```

### Prediction Object
```json
{
  "estimatedCompletion": 3,
  "bottleneckDetected": false,
  "resourceUtilization": 78,
  "confidence": 85
}
```

---

## 🎨 Color Coding

### Priority Colors
- 🔴 **High**: Red (#ef4444)
- 🟡 **Medium**: Yellow/Orange (#f59e0b)
- 🟢 **Low**: Green (#10b981)

### Status Colors
- ✅ **Completed**: Green (#22c55e)
- 🔵 **In Progress**: Blue (#3b82f6)
- ⚪ **Pending**: Gray (#9ca3af)

### Severity Colors
- 🔴 **Critical**: Red (#dc2626)
- 🟡 **Warning**: Orange (#f97316)
- 🔵 **Info**: Blue (#0284c7)

---

## ⚙️ Configuration Files

### Backend
- `backend/server.js` - Main Express app
- `backend/config/db.js` - MongoDB connection
- `.env` - Environment variables (create locally)

### Frontend
- `frontend/vite.config.js` - Vite build config
- `frontend/src/utils/apiPaths.js` - API routes
- `frontend/src/utils/axiosinstance.js` - HTTP config
- `tailwind.config.js` - Tailwind styling config

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot fetch tasks"**
- Verify backend running: http://localhost:5000
- Check MongoDB connection in console
- Verify CORS allows localhost:5174

**"AI Dashboard shows no data"**
- Ensure tasks exist in database
- Check browser console for errors
- Click refresh button on dashboard

**"Auto-save not working"**
- Check localStorage quota
- Verify browser allows storage
- Check console for errors

**"Charts not showing"**
- Verify Recharts installed: `npm list recharts`
- Check data is being fetched
- Verify chart component exports

---

## 📊 Sample Test Data

### Test Task 1
```json
{
  "title": "Design UI mockups",
  "description": "Create comprehensive UI mockups for the dashboard with all interactive elements and responsive layouts.",
  "priority": "High",
  "dueDate": "2024-11-20",
  "labels": ["design", "urgent"]
}
```

### Test Task 2
```json
{
  "title": "Review pull requests",
  "description": "Review pending PRs from team members",
  "priority": "Medium",
  "dueDate": "2024-11-18",
  "labels": ["code-review"]
}
```

---

## 📚 File Locations

| Component | Path |
|-----------|------|
| AI Dashboard | `frontend/src/pages/Admin/AIDashboard.jsx` |
| Enhanced Input | `frontend/src/components/EnhancedInput.jsx` |
| AI Suggestions | `frontend/src/utils/aiSuggestions.js` |
| Enhanced Create | `frontend/src/pages/Admin/CreateTaskEnhanced.jsx` |
| Menu Data | `frontend/src/utils/data.js` |
| API Paths | `frontend/src/utils/apiPaths.js` |
| User Context | `frontend/src/context/userContext.jsx` |
| App Routes | `frontend/src/App.jsx` |
| Backend Server | `backend/server.js` |

---

## ✅ Pre-Deployment Checklist

- [ ] Backend .env configured with MongoDB URI
- [ ] Frontend API paths pointing to correct backend
- [ ] CORS origins updated for production
- [ ] All environment variables set
- [ ] JWT secret configured
- [ ] Database backups created
- [ ] Error logging configured
- [ ] HTTPS certificates ready
- [ ] Rate limiting configured
- [ ] Input validation enabled

---

## 🚀 Deployment Tips

### Backend (Node.js)
```bash
# Build
npm install --production

# Run
NODE_ENV=production node backend/server.js

# Docker deployment
docker build -t task-manager-backend .
docker run -p 5000:5000 task-manager-backend
```

### Frontend (React)
```bash
# Build
npm run build

# Deploy dist folder to CDN/Server
# Serve on http://localhost (reverse proxy to backend)
```

---

## 📞 Support

For issues:
1. Check browser console for errors (F12)
2. Check backend logs
3. Verify MongoDB connection
4. Clear browser cache and localStorage
5. Try incognito/private mode
6. Restart both frontend and backend

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0
