# ⚡ Quick Reference - New Features

## Components to Import

### In Your App/Dashboard
```jsx
import AIAssistant from '@/components/AIAssistant';
import TaskComments from '@/components/TaskComments';
import PomodoroTimer from '@/components/PomodoroTimer';
import KanbanBoard from '@/pages/Admin/KanbanBoard';
```

### Usage in Pages

```jsx
// In Dashboard or Main App
<AIAssistant />  // Floating button - add anywhere in app

// In Task Detail Page
<TaskComments taskId={taskId} isOpen={showComments} onClose={handleClose} />

// In a dedicated page
<PomodoroTimer />

// As a full page view
<KanbanBoard />
```

---

## API Quick Calls

### Get User Preferences
```javascript
import axiosInstance from '@/utils/axiosinstance';

const getPreferences = async () => {
  const response = await axiosInstance.get('/api/settings/preferences');
  return response.data.data;
};
```

### Add Comment
```javascript
const addComment = async (taskId, content) => {
  const response = await axiosInstance.post(
    `/api/tasks/${taskId}/comments`,
    { content }
  );
  return response.data.data;
};
```

### AI Task Breakdown
```javascript
const breakdownTask = async (title, description) => {
  const response = await axiosInstance.post(
    '/api/ai/suggest-breakdown',
    { taskTitle: title, taskDescription: description }
  );
  return response.data.data;
};
```

### Get Task Comments
```javascript
const getComments = async (taskId) => {
  const response = await axiosInstance.get(
    `/api/tasks/${taskId}/comments?limit=20&skip=0`
  );
  return response.data.data.comments;
};
```

### Save Time Entry
```javascript
const saveTimeEntry = async (taskId, duration) => {
  await axiosInstance.post(
    `/api/tasks/${taskId}/time/manual`,
    { duration, description: 'Manual time entry' }
  );
};
```

---

## Database Query Examples

### Get All Comments for a Task
```javascript
const Comment = require('../models/Comment');
const comments = await Comment.find({ task: taskId })
  .populate('author', 'name profileImageUrl email')
  .sort({ createdAt: -1 });
```

### Get User Preferences
```javascript
const User = require('../models/User');
const user = await User.findById(userId).select('preferences notificationSettings');
```

### Get Comments with Reactions
```javascript
const comments = await Comment.find({ task: taskId })
  .populate('author', 'name profileImageUrl')
  .populate('reactions.user', 'name');
```

---

## Configuration Objects

### Notification Settings Default
```javascript
{
  taskAssigned: true,
  taskDueSoon: true,
  taskCompleted: false,
  mentionedInComment: true,
  dailyDigest: true,
  weeklyReport: false
}
```

### User Preferences Default
```javascript
{
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  emailNotifications: true,
  pushNotifications: true,
  weekStartsOn: 'monday'
}
```

### AI Response Format (Breakdown)
```javascript
{
  suggestedSubtasks: ['Task 1', 'Task 2', ...],
  estimatedDuration: '2-3 days',
  difficulty: 'Medium',
  tips: ['Tip 1', 'Tip 2', ...]
}
```

### Comment Structure
```javascript
{
  _id: ObjectId,
  task: ObjectId,
  author: {
    _id: ObjectId,
    name: String,
    email: String,
    profileImageUrl: String
  },
  content: String,
  reactions: [{ emoji: String, count: Number }],
  isEdited: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling Patterns

### Settings Update
```javascript
try {
  await axiosInstance.put('/api/settings/profile', updateData);
  showMessage('Profile updated successfully!', 'success');
} catch (error) {
  showMessage(
    error.response?.data?.message || 'Error updating profile',
    'error'
  );
}
```

### Comment Operations
```javascript
try {
  const response = await axiosInstance.post(
    `/api/tasks/${taskId}/comments`,
    { content }
  );
  // Update UI optimistically
} catch (error) {
  if (error.response?.status === 404) {
    alert('Task not found');
  } else if (error.response?.status === 401) {
    alert('Please login first');
  } else {
    alert('Error: ' + error.response?.data?.message);
  }
}
```

---

## State Management Patterns

### Comment List with Pagination
```javascript
const [comments, setComments] = useState([]);
const [page, setPage] = useState(0);

const loadMore = async () => {
  const response = await axiosInstance.get(
    `/api/tasks/${taskId}/comments?limit=20&skip=${page * 20}`
  );
  setComments(prev => [...prev, ...response.data.data.comments]);
  setPage(prev => prev + 1);
};
```

### Settings with Auto-save
```javascript
const [preferences, setPreferences] = useState(initialPrefs);
const [hasChanged, setHasChanged] = useState(false);

const handlePrefChange = (key, value) => {
  setPreferences(prev => ({ ...prev, [key]: value }));
  setHasChanged(true);
};

const autoSave = useEffect(() => {
  const timer = setTimeout(async () => {
    if (hasChanged) {
      await updatePreferences();
      setHasChanged(false);
    }
  }, 2000);
  return () => clearTimeout(timer);
}, [preferences, hasChanged]);
```

---

## Environment Variables

```env
# Backend
MONGODB_URI=mongodb://localhost:27017/taskdb
JWT_SECRET=your_secret_key
ADMIN_INVITE_TOKEN=admin_token_123
PORT=5000

# Frontend (in .env or .env.local)
VITE_API_URL=http://localhost:5000
VITE_ENV=development
```

---

## Common Bugs & Fixes

### Bug: Comments not appearing
**Fix**: Check `populate()` calls in controller, verify foreign keys

### Bug: Settings not persisting
**Fix**: Verify user._id vs req.user.id consistency in controller

### Bug: AI endpoints timing out
**Fix**: Check function execution time, add error boundaries

### Bug: Kanban drag-drop freezing
**Fix**: Verify react-beautiful-dnd version, check list re-renders

### Bug: Pomodoro timer not starting
**Fix**: Check browser console for Audio API errors, verify permissions

---

## Performance Tips

### Optimize Comment Queries
```javascript
// ❌ Bad - loads all fields
const comments = await Comment.find({ task: taskId });

// ✅ Good - selective fields
const comments = await Comment.find({ task: taskId })
  .select('author content reactions createdAt')
  .lean();
```

### Optimize Frontend Renders
```javascript
// ✅ Use React.memo for list items
const CommentItem = React.memo(({ comment, onDelete }) => (
  <div>{comment.content}</div>
));

// ✅ Pagination instead of infinite scroll
const [page, setPage] = useState(0);
```

### Cache Preferences
```javascript
// Store in localStorage to avoid repeated API calls
const getCachedPreferences = () => {
  const cached = localStorage.getItem('userPreferences');
  return cached ? JSON.parse(cached) : null;
};
```

---

## Testing Commands

```bash
# Test backend server
curl -X GET http://localhost:5000/api/settings/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test comment endpoint
curl -X POST http://localhost:5000/api/tasks/TASK_ID/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test comment"}'

# Test AI endpoint
curl -X POST http://localhost:5000/api/ai/suggest-breakdown \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskTitle":"Build API","taskDescription":"REST endpoints"}'
```

---

## Browser DevTools Tips

### Check API Responses
```javascript
// In Console
const api = await fetch('/api/tasks/123/comments', {
  headers: {'Authorization': 'Bearer TOKEN'}
});
console.log(await api.json());
```

### Debug React State
```javascript
// In Console (React DevTools must be installed)
$r.state  // View component state
$r.props  // View component props
```

### Monitor Network
1. Open DevTools → Network tab
2. Filter by fetch/xhr
3. Check response status and headers
4. View payload in Preview

---

## Useful Links

- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/
- **Axios**: https://axios-http.com/
- **React Beautiful DND**: https://github.com/atlassian/react-beautiful-dnd
- **React Icons**: https://react-icons.github.io/react-icons/

---

## Quick Snippets

### Format Date
```javascript
import moment from 'moment';
moment(date).format('MMMM DD, YYYY');  // Dec 20, 2025
moment(date).fromNow();                 // 2 hours ago
```

### Show Toast Message
```javascript
const [message, setMessage] = useState('');

const showMessage = (msg, type = 'success') => {
  setMessage(msg);
  setTimeout(() => setMessage(''), 3000);
};
```

### Handle Loading State
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

---

**Last Updated**: November 15, 2025
**Version**: 1.0.0

