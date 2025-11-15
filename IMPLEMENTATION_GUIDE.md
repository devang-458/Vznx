# 🛠️ Implementation Guide - Task Management System

## Quick Start

### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Environment variables** (`.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your_jwt_secret_key
ADMIN_INVITE_TOKEN=your_admin_token
NODE_ENV=development
```

3. **Start server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start dev server**
```bash
npm run dev
```

3. **Build for production**
```bash
npm run build
```

---

## Database Schema Quick Reference

### Collections Created

#### 1. Users
```javascript
- name: String
- email: String (unique)
- password: String (hashed)
- profileImageUrl: String
- role: String (admin | member)
- preferences: Object
- notificationSettings: Object
- lastLogin: Date
- isActive: Boolean
- timestamps
```

#### 2. Comments (NEW)
```javascript
- task: ObjectId → Task
- author: ObjectId → User
- content: String
- mentions: [ObjectId] → Users
- attachments: [String]
- reactions: [{user: ObjectId, emoji: String}]
- isEdited: Boolean
- editedAt: Date
- parentComment: ObjectId (self-reference)
- timestamps
```

#### 3. Tasks (Enhanced)
```javascript
// Existing fields plus:
- timeEntries: [{user, startTime, endTime, duration, description}]
- totalTimeSpent: Number
- pomodoroSessions: Number
```

---

## API Endpoints Reference

### Authentication & Settings
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - User login (updates lastLogin)
GET    /api/auth/profile               - Get user profile
PUT    /api/auth/profile               - Update profile
PUT    /api/settings/profile           - Update profile (duplicate route)
GET    /api/settings/preferences       - Get user preferences
PUT    /api/settings/preferences       - Update preferences
PUT    /api/auth/notifications         - Update notification settings
DELETE /api/settings/account           - Delete account (requires confirmation)
GET    /api/settings/export-data       - Export user data (GDPR)
POST   /api/auth/upload-image          - Upload profile image
```

### Comments
```
POST   /api/tasks/:taskId/comments     - Add comment
GET    /api/tasks/:taskId/comments     - Get all comments (paginated)
GET    /api/comments/:commentId        - Get comment thread
PUT    /api/comments/:commentId        - Update comment
DELETE /api/comments/:commentId        - Delete comment (cascade to replies)
POST   /api/comments/:commentId/react  - Add/toggle reaction
POST   /api/comments/:commentId/reply  - Reply to comment
```

### AI Assistant
```
POST   /api/ai/suggest-breakdown       - Break task into subtasks
POST   /api/ai/suggest-assignee        - Suggest best team member
POST   /api/ai/smart-schedule          - Suggest optimal deadline
POST   /api/ai/generate-description    - Generate task description
POST   /api/ai/predict-completion      - Predict completion date
```

### Time Tracking
```
POST   /api/tasks/:taskId/time/start   - Start timer
POST   /api/tasks/:taskId/time/stop    - Stop timer
GET    /api/tasks/:taskId/time         - Get time entries
POST   /api/tasks/:taskId/time/manual  - Add manual time entry
```

---

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── AIAssistant.jsx               - Floating AI panel (NEW)
│   ├── AIAssistant.css               - AI styling (NEW)
│   ├── TaskComments.jsx              - Comment modal (NEW)
│   ├── PomodoroTimer.jsx             - Pomodoro UI (NEW)
│   └── [existing components...]
├── pages/
│   ├── Settings/
│   │   └── UserSettings.jsx          - Settings page (ENHANCED)
│   ├── Admin/
│   │   └── KanbanBoard.jsx           - Kanban view (NEW)
│   └── [existing pages...]
└── utils/
    └── apiPaths.js                   - API endpoints (UPDATED)
```

### Backend Controllers

```
backend/
├── controller/
│   ├── authController.js             - Auth logic (ENHANCED)
│   ├── settingsController.js         - Settings logic (UPDATED)
│   ├── commentController.js          - Comments (NEW)
│   ├── aiController.js               - AI logic (NEW)
│   └── [existing controllers...]
├── models/
│   ├── User.js                       - User model (ENHANCED)
│   ├── Comment.js                    - Comment model (NEW)
│   ├── Task.js                       - Task model (EXISTING)
│   └── [existing models...]
├── routes/
│   ├── authRoutes.js                 - Auth routes (ENHANCED)
│   ├── settingsRoutes.js             - Settings routes (EXISTING)
│   ├── commentRoutes.js              - Comment routes (NEW)
│   ├── aiRoutes.js                   - AI routes (NEW)
│   └── [existing routes...]
└── server.js                         - Main server (UPDATED)
```

---

## Feature Integration Checklist

### ✅ Settings Screen
- [x] User model with preferences
- [x] Settings controller with all endpoints
- [x] Auth controller enhancements
- [x] Settings routes
- [x] UserSettings component (5 tabs)
- [x] API paths updated

### ✅ Comments System
- [x] Comment model created
- [x] Comment controller with 7 endpoints
- [x] Comment routes
- [x] TaskComments component
- [x] API paths added

### ✅ AI Assistant
- [x] AI controller with 5 features
- [x] AI routes
- [x] AIAssistant component (floating panel)
- [x] API paths added

### ✅ Kanban Board
- [x] KanbanBoard component
- [x] Drag-drop integration
- [x] Task status updates
- [x] Responsive layout

### ✅ Pomodoro Timer
- [x] PomodoroTimer component
- [x] Session tracking
- [x] Task focus feature
- [x] Audio notifications

---

## Testing the Features

### 1. Test Settings
```bash
# Navigate to /settings in browser
# Test each tab:
# - Profile: Update name/email, change password
# - Security: Verify password validation
# - Notifications: Toggle notification types
# - Preferences: Change theme, language, timezone
# - Privacy: Export data, delete account
```

### 2. Test Comments
```bash
# Go to task detail view
# Add comment in TaskComments modal
# Test reactions (👍 ❤️ 🎉)
# Delete/edit comments
# Test comment threading
```

### 3. Test AI Assistant
```bash
# Click floating AI button
# Test task breakdown with various titles
# Test assignee suggestions
# Test smart schedule
# Verify AI logic
```

### 4. Test Kanban Board
```bash
# Navigate to /admin/kanban
# Drag tasks between columns
# Verify status updates in backend
# Check task count badges
# View task details from cards
```

### 5. Test Pomodoro
```bash
# Open PomodoroTimer component
# Start work session
# Switch between work/break modes
# Test session counter
# Select task to focus on
```

---

## Debugging Tips

### Backend Debugging

1. **Enable verbose logging**
```javascript
// In controller endpoints
console.log('Request:', req.body);
console.log('Response:', result);
```

2. **Check MongoDB connection**
```bash
# Verify MongoDB is running
mongod --version
# Check connection string in .env
```

3. **Test endpoints with Postman/Curl**
```bash
curl -X POST http://localhost:5000/api/ai/suggest-breakdown \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskTitle":"Build API","taskDescription":"REST API"}'
```

### Frontend Debugging

1. **Check browser console**
   - Open DevTools (F12)
   - Check Network tab for API calls
   - Check Console for errors

2. **Verify API paths**
```javascript
// In browser console
import { API_PATHS } from './utils/apiPaths';
console.log(API_PATHS.AI);
```

3. **Test axios requests**
```javascript
// In browser console
axiosInstance.get('/api/ai/suggest-breakdown', ...)
  .then(res => console.log(res))
  .catch(err => console.log(err))
```

---

## Environment-Specific Configuration

### Development (.env.development)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager-dev
JWT_SECRET=dev_secret_key_123
NODE_ENV=development
DEBUG=true
```

### Production (.env.production)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/task-manager
JWT_SECRET=very_long_secure_secret_key
NODE_ENV=production
DEBUG=false
```

---

## Performance Optimization Tips

### Database
1. **Add indexes for frequent queries**
```javascript
// In Comment model
CommentSchema.index({ task: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
```

2. **Use lean() for read-only queries**
```javascript
const comments = await Comment.find({task: taskId}).lean();
```

3. **Implement pagination**
```javascript
// Frontend
const LIMIT = 20;
const SKIP = page * LIMIT;
```

### Frontend
1. **Lazy load components**
```javascript
const AIAssistant = React.lazy(() => import('./AIAssistant'));
```

2. **Memoize expensive components**
```javascript
export default React.memo(KanbanBoard);
```

3. **Use React.lazy for routes**
```javascript
const KanbanBoard = lazy(() => import('./pages/Admin/KanbanBoard'));
```

---

## Common Issues & Solutions

### Issue: Comments not loading
**Solution**: Check authentication token, verify comment routes registered

### Issue: AI endpoints returning 500
**Solution**: Check Node version compatibility, verify Controller syntax

### Issue: Kanban drag-drop not working
**Solution**: Verify `react-beautiful-dnd` installed, check console for errors

### Issue: Settings not saving
**Solution**: Verify user ID from JWT, check validation in controller

### Issue: Pomodoro audio not playing
**Solution**: Check browser autoplay permissions, use fallback notification

---

## Deployment Checklist

### Before Deploying
- [ ] All environment variables set
- [ ] MongoDB connection verified
- [ ] API endpoints tested
- [ ] Frontend build completed
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Error logging configured
- [ ] Rate limiting added

### Deployment Steps
1. Build frontend: `npm run build`
2. Deploy to server/CDN
3. Start backend: `npm start`
4. Verify all endpoints
5. Monitor error logs
6. Test with production data

---

## Future Enhancements

### Phase 1 (Next)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Push notifications

### Phase 2
- [ ] Google Calendar sync
- [ ] Slack integration
- [ ] GitHub integration

### Phase 3
- [ ] Advanced analytics dashboard
- [ ] Team leaderboard
- [ ] Task templates

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] API documentation (Swagger)

---

## Documentation References

- **API Docs**: See FEATURES.md
- **Database Schema**: See models/ folder
- **Component Props**: Check JSDoc in component files
- **Route Handlers**: See routes/ folder
- **Controller Logic**: See controller/ folder

---

## Support

For issues or questions:
1. Check FEATURES.md for feature details
2. Review controller files for endpoint specifications
3. Check component JSDoc comments
4. Review error messages in console/logs
5. Test with Postman/curl before reporting

