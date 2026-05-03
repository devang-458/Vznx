# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered task management system (MERN stack) with features including:
- Task/project/issue management with Kanban boards
- AI assistance (task breakdown, assignee suggestions, smart scheduling)
- Real-time collaboration (comments, reactions, messaging)
- Time tracking with Pomodoro timer
- User settings with preferences and notifications

## Commands

### Backend
```bash
cd backend
npm install              # Install dependencies
npm start                # Start server (production)
npm run dev              # Start server with nodemon (development)
```

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Run ESLint
```

## Architecture

### Backend (`backend/`)
- **Entry**: `server.js` - Express server with Socket.IO, port 5000
- **Config**: `config/db.js` - MongoDB connection via Mongoose
- **Models**: `models/*.js` - Mongoose schemas (User, Task, Project, Issue, Comment, Message, Activity, Insight, Board)
- **Controllers**: `controller/*.js` - Business logic for each domain
- **Routes**: `routes/*.js` - API endpoint definitions
- **Middleware**: `authMiddleware.js` (JWT), `validationMiddleware.js`, `errorHandler.js`, `uploadMiddleware.js`
- **Services**: `services/*.js` - Shared business logic
- **Validation**: `validation/*.js` - Joi schemas

### Frontend (`frontend/`)
- **Entry**: `src/App.jsx` - React Router with role-based routes (admin/user)
- **State**: `context/userContext.jsx` - User auth context provider
- **HTTP**: `utils/axiosinstance.js` - Axios with JWT interceptor, `utils/apiPaths.js` - endpoint constants
- **Components**: `components/` - Reusable UI (AIAssistant, TaskComments, PomodoroTimer, KanbanBoard, charts)
- **Pages**: `pages/` - Route views organized by role (Admin/, User/, Settings/, Messages/)
- **Hooks**: `hooks/` - Custom hooks including `useSocket.js`

### Database Models
- **User**: name, email, password, role (admin/member), preferences, notificationSettings
- **Task**: title, description, priority, status, dueDate, assignedTo, project, todoChecklist, timeEntries
- **Project**: name, description, members, issues
- **Issue**: title, description, type (Story/Task/Bug), status, priority, assignee, subtasks
- **Comment**: task, author, content, mentions, reactions, parentComment (threading)

## API Endpoints

| Prefix | Domain |
|--------|--------|
| `/api/auth` | Authentication (login, register, profile) |
| `/api/users` | User management |
| `/api/tasks` | Task CRUD, comments, time tracking |
| `/api/projects` | Project management |
| `/api/issues` | Issue tracking, AI subtask generation |
| `/api/ai` | AI features (breakdown, assignee, schedule, description, prediction) |
| `/api/settings` | User preferences, notifications, data export |
| `/api/comments` | Comment operations |
| `/api/messages` | Real-time messaging |
| `/api/insights` | AI predictive insights |
| `/api/bulk-operations` | Bulk status/priority/assign updates |
| `/api/search` | Task/user search and filters |
| `/api/analytics` | Team analytics, insights |
| `/api/activities` | Activity feed |
| `/api/reports` | Export, burndown charts |

## Key Patterns

- **Authentication**: JWT stored in localStorage, attached via axios interceptor as `Bearer <token>`
- **Role-based routing**: `<PrivateRoute allowedRoles={['admin']}>` wraps admin routes
- **Real-time**: Socket.IO initialized in `server.js`, used via `useSocket` hook
- **AI Integration**: Google Generative AI (`@google/generative-ai`) in `aiController.js`
- **Styling**: Tailwind CSS v4 with Vite plugin

## Environment Variables

### Backend (`.env`)
```
PORT=5000
MONGODB_URI=<mongodb_connection_string>
JWT_SECRET=<secret>
ADMIN_INVITE_TOKEN=<admin_registration_token>
```

### Frontend (`.env`)
```
VITE_APP_API_URL=http://localhost:5000
VITE_BASE_PATH=/
```

## Documentation

Existing documentation in root:
- `README.md` - Documentation index with navigation guide
- `FEATURES.md` - Complete feature specifications
- `IMPLEMENTATION_GUIDE.md` - Setup and implementation details
- `QUICK_REFERENCE.md` - API and component quick reference
- `TODO.md` - Pending frontend work

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
