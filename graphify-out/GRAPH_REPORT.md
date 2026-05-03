# Graph Report - .  (2026-04-22)

## Corpus Check
- 146 files · ~76,982 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 311 nodes · 245 edges · 99 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend Admin Pages|Frontend Admin Pages]]
- [[_COMMUNITY_User Management Backend|User Management Backend]]
- [[_COMMUNITY_Activity & Bulk Operations|Activity & Bulk Operations]]
- [[_COMMUNITY_AI Task Generation|AI Task Generation]]
- [[_COMMUNITY_Module 4|Module 4]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Project Management|Project Management]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Messaging|Messaging]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Module 11|Module 11]]
- [[_COMMUNITY_React Hooks & Context|React Hooks & Context]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Module 17|Module 17]]
- [[_COMMUNITY_Project Management|Project Management]]
- [[_COMMUNITY_Project Management|Project Management]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_Module 23|Module 23]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Messaging|Messaging]]
- [[_COMMUNITY_Messaging|Messaging]]
- [[_COMMUNITY_Messaging|Messaging]]
- [[_COMMUNITY_React Hooks & Context|React Hooks & Context]]
- [[_COMMUNITY_Module 52|Module 52]]
- [[_COMMUNITY_Issue Tracking|Issue Tracking]]
- [[_COMMUNITY_Module 54|Module 54]]
- [[_COMMUNITY_Module 55|Module 55]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_Module 57|Module 57]]
- [[_COMMUNITY_Module 58|Module 58]]
- [[_COMMUNITY_Module 59|Module 59]]
- [[_COMMUNITY_Module 60|Module 60]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_Comments|Comments]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_Issue Tracking|Issue Tracking]]
- [[_COMMUNITY_Messaging|Messaging]]
- [[_COMMUNITY_Project Management|Project Management]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Data Models|Data Models]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_Comments|Comments]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_Issue Tracking|Issue Tracking]]
- [[_COMMUNITY_Messaging|Messaging]]
- [[_COMMUNITY_Project Management|Project Management]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_Validation|Validation]]
- [[_COMMUNITY_Validation|Validation]]
- [[_COMMUNITY_Comments|Comments]]
- [[_COMMUNITY_Messaging|Messaging]]
- [[_COMMUNITY_Task Management|Task Management]]
- [[_COMMUNITY_Validation|Validation]]
- [[_COMMUNITY_Module 91|Module 91]]
- [[_COMMUNITY_Module 92|Module 92]]
- [[_COMMUNITY_Module 93|Module 93]]
- [[_COMMUNITY_Module 94|Module 94]]
- [[_COMMUNITY_Module 95|Module 95]]
- [[_COMMUNITY_Module 96|Module 96]]
- [[_COMMUNITY_Module 97|Module 97]]
- [[_COMMUNITY_Module 98|Module 98]]

## God Nodes (most connected - your core abstractions)
1. `useFetchData()` - 20 edges
2. `useUserAuth()` - 14 edges
3. `createActivity()` - 7 edges
4. `suggestTaskBreakdown()` - 5 edges
5. `debug()` - 4 edges
6. `generateTaskDescription()` - 4 edges
7. `MyTasks()` - 4 edges
8. `UserDashboard()` - 4 edges
9. `sendMessageToUser()` - 3 edges
10. `createUser()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `registerUser()` --calls--> `debug()`  [INFERRED]
  backend\services\userService.js → backend\config\debug.js
- `bulkUpdateStatus()` --calls--> `createActivity()`  [INFERRED]
  backend\controller\bulkOperationsController.js → backend\controller\activityController.js
- `bulkUpdatePriority()` --calls--> `createActivity()`  [INFERRED]
  backend\controller\bulkOperationsController.js → backend\controller\activityController.js
- `bulkAssignTasks()` --calls--> `createActivity()`  [INFERRED]
  backend\controller\bulkOperationsController.js → backend\controller\activityController.js
- `bulkDeleteTasks()` --calls--> `createActivity()`  [INFERRED]
  backend\controller\bulkOperationsController.js → backend\controller\activityController.js

## Communities

### Community 0 - "Frontend Admin Pages"
Cohesion: 0.06
Nodes (20): BulkOperationsTaskManager(), BurndownChartPage(), CreateIssue(), CreateProject(), CreateTask(), Dashboard(), EditProject(), KanbanBoard() (+12 more)

### Community 1 - "User Management Backend"
Cohesion: 0.11
Nodes (9): createUser(), getUsers(), updateUser(), createNewUser(), generateToken(), getAllUsers(), loginUser(), registerUser() (+1 more)

### Community 2 - "Activity & Bulk Operations"
Cohesion: 0.12
Nodes (6): createActivity(), bulkAssignTasks(), bulkDeleteTasks(), bulkUpdatePriority(), bulkUpdateStatus(), createUser()

### Community 3 - "AI Task Generation"
Cohesion: 0.24
Nodes (9): calculateDifficulty(), calculateEffortLevel(), estimateTaskDuration(), generateChecklist(), generateDescriptionFromTitle(), generateSubtasksFromDescription(), generateTaskDescription(), getTaskTips() (+1 more)

### Community 4 - "Module 4"
Cohesion: 0.18
Nodes (0): 

### Community 5 - "Task Management"
Cohesion: 0.18
Nodes (0): 

### Community 6 - "Project Management"
Cohesion: 0.24
Nodes (5): debug(), generateProjectWorkflow(), getAIResponse(), getProject(), updateProject()

### Community 7 - "Task Management"
Cohesion: 0.22
Nodes (3): addThousandsSeparator(), MyTasks(), UserDashboard()

### Community 8 - "Task Management"
Cohesion: 0.25
Nodes (0): 

### Community 9 - "Messaging"
Cohesion: 0.29
Nodes (3): sendMessage(), getIo(), sendMessageToUser()

### Community 10 - "Task Management"
Cohesion: 0.29
Nodes (2): generatePlaceholders(), CreateTaskEnhanced()

### Community 11 - "Module 11"
Cohesion: 0.33
Nodes (0): 

### Community 12 - "React Hooks & Context"
Cohesion: 0.33
Nodes (2): AppContent(), useSocket()

### Community 13 - "Task Management"
Cohesion: 0.4
Nodes (0): 

### Community 14 - "Task Management"
Cohesion: 0.5
Nodes (2): calculateWorkloadScore(), getTaskInsights()

### Community 15 - "Middleware"
Cohesion: 0.67
Nodes (0): 

### Community 16 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Module 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Project Management"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Project Management"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Module 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "UI Components"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Messaging"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Messaging"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Messaging"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "React Hooks & Context"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Module 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Issue Tracking"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Module 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Module 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Module 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Module 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Module 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Module 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Data Models"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Data Models"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Comments"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Data Models"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Issue Tracking"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Messaging"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Project Management"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Data Models"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "Comments"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "Issue Tracking"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "Messaging"
Cohesion: 1.0
Nodes (0): 

### Community 79 - "Project Management"
Cohesion: 1.0
Nodes (0): 

### Community 80 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 81 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 84 - "API Routes"
Cohesion: 1.0
Nodes (0): 

### Community 85 - "Validation"
Cohesion: 1.0
Nodes (0): 

### Community 86 - "Validation"
Cohesion: 1.0
Nodes (0): 

### Community 87 - "Comments"
Cohesion: 1.0
Nodes (0): 

### Community 88 - "Messaging"
Cohesion: 1.0
Nodes (0): 

### Community 89 - "Task Management"
Cohesion: 1.0
Nodes (0): 

### Community 90 - "Validation"
Cohesion: 1.0
Nodes (0): 

### Community 91 - "Module 91"
Cohesion: 1.0
Nodes (0): 

### Community 92 - "Module 92"
Cohesion: 1.0
Nodes (0): 

### Community 93 - "Module 93"
Cohesion: 1.0
Nodes (0): 

### Community 94 - "Module 94"
Cohesion: 1.0
Nodes (0): 

### Community 95 - "Module 95"
Cohesion: 1.0
Nodes (0): 

### Community 96 - "Module 96"
Cohesion: 1.0
Nodes (0): 

### Community 97 - "Module 97"
Cohesion: 1.0
Nodes (0): 

### Community 98 - "Module 98"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `UI Components`** (2 nodes): `getFiles()`, `check_unused_components.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 17`** (2 nodes): `db.js`, `connectDB()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Management`** (2 nodes): `issueController.js`, `checkProjectMembership()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Management`** (2 nodes): `reportController.js`, `checkProjectMembership()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Middleware`** (2 nodes): `errorHandler.js`, `errorHandler()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Middleware`** (2 nodes): `uploadMiddleware.js`, `checkFileType()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Middleware`** (2 nodes): `validationMiddleware.js`, `validate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 23`** (2 nodes): `insightService.js`, `mockGenerateInsight()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `ActivityFeed()`, `ActivityFeed.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `AIAssistant()`, `AIAssistant.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (2 nodes): `AITaskInput()`, `AITaskInput.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `AssigneeDropdown()`, `AssigneeDropdown.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `EnhancedInput()`, `EnhancedInput.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `GenerateWorkflowModal.jsx`, `GenerateWorkflowModal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `PomodoroTimer.jsx`, `PomodoroTimer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (2 nodes): `TaskComments.jsx`, `TaskComments()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (2 nodes): `TaskDetailModal.jsx`, `TaskDetailModal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (2 nodes): `TaskListTable.jsx`, `TaskListTable()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `InfoCard.jsx`, `InfoCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (2 nodes): `TaskCard.jsx`, `TaskCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `CustomBarChart()`, `CustomBarChart.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `CustomLegend()`, `CustomLegend.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `CustomPieChart()`, `CustomPieChart.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `CustomTooltip()`, `CustomTooltip.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `Input.jsx`, `Input()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `ProfilePhotoSelector.jsx`, `ProfilePhotoSelector()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `AuthLayout()`, `AuthLayout.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `Button()`, `Button.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `DashboardLayout()`, `DashboardLayout.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `Navbar.jsx`, `Navbar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `NotificationPopup.jsx`, `NotificationPopup()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Components`** (2 nodes): `SideMenu.jsx`, `SideMenu()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Messaging`** (2 nodes): `ChatWindow()`, `ChatWindow.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Messaging`** (2 nodes): `ConversationList()`, `ConversationList.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Messaging`** (2 nodes): `NewChatModal.jsx`, `NewChatModal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Hooks & Context`** (2 nodes): `userContext.jsx`, `UserProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 52`** (2 nodes): `AIDashboard()`, `AIDashboard.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Issue Tracking`** (2 nodes): `IssueDetails.jsx`, `IssueDetails()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 54`** (2 nodes): `Login.jsx`, `Login()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 55`** (2 nodes): `Signup.jsx`, `Signup()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (2 nodes): `PrivateRoute.jsx`, `PrivateRoute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 57`** (2 nodes): `uploadImage.js`, `uploadImage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 58`** (1 nodes): `dubug.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 59`** (1 nodes): `server.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 60`** (1 nodes): `insightController.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Models`** (1 nodes): `Activity.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Models`** (1 nodes): `Board.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Comments`** (1 nodes): `Comment.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Models`** (1 nodes): `Insight.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Issue Tracking`** (1 nodes): `Issue.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Messaging`** (1 nodes): `Message.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Management`** (1 nodes): `Project.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (1 nodes): `Task.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Models`** (1 nodes): `User.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `activityRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `aiRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `analyticsRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `authRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `bulkOperationsRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Comments`** (1 nodes): `commentRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `insightRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Issue Tracking`** (1 nodes): `issueRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Messaging`** (1 nodes): `messageRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Project Management`** (1 nodes): `projectRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `reportRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `searchRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `settingsRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (1 nodes): `taskRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Routes`** (1 nodes): `userRoutes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Validation`** (1 nodes): `authValidation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Validation`** (1 nodes): `bulkOperationsValidation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Comments`** (1 nodes): `commentValidation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Messaging`** (1 nodes): `messageValidation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Management`** (1 nodes): `taskValidation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Validation`** (1 nodes): `userValidation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 91`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 92`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 93`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 94`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 95`** (1 nodes): `apiPaths.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 96`** (1 nodes): `axiosinstance.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 97`** (1 nodes): `data.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 98`** (1 nodes): `socket.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useFetchData()` connect `Frontend Admin Pages` to `Task Management`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `createActivity()` connect `Activity & Bulk Operations` to `User Management Backend`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `createUser()` connect `User Management Backend` to `Activity & Bulk Operations`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `useFetchData()` (e.g. with `BulkOperationsTaskManager()` and `BurndownChartPage()`) actually correct?**
  _`useFetchData()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `useUserAuth()` (e.g. with `Messages()` and `BurndownChartPage()`) actually correct?**
  _`useUserAuth()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `createActivity()` (e.g. with `bulkUpdateStatus()` and `bulkUpdatePriority()`) actually correct?**
  _`createActivity()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `debug()` (e.g. with `getProject()` and `updateProject()`) actually correct?**
  _`debug()` has 3 INFERRED edges - model-reasoned connections that need verification._