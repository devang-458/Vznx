import { useContext, useState } from 'react'
import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  Router,
  Outlet,
  Navigate
} from 'react-router-dom'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Admin/Dashboard'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import PrivateRoute from './routes/PrivateRoute'
import UserDashboard from './pages/User/UserDashboard'
import ViewTaskDetails from './pages/User/ViewTaskDetails'
import UserProvider, { UserContext } from './context/userContext'
import MyTasks from './pages/User/MyTasks'
import ManageUsers from './pages/Admin/ManageUsers'
import TaskInsightsDashboard from './pages/Insights/TaskInsightsDashboard'
import BulkOperationsTaskManager from './pages/Admin/BulkOperationsTaskManager'
import AIDashboard from './pages/Admin/AIDashboard'
import UserSettings from './pages/Settings/UserSettings'
import Messages from './pages/Messages'
import useSocket from './hooks/useSocket'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NotificationPopup from './components/layouts/NotificationPopup'
import DashboardLayout from './components/layouts/DashboardLayout'
import ProjectList from './pages/Admin/ProjectList'
import CreateProject from './pages/Admin/CreateProject'
import KanbanBoard from './pages/Admin/KanbanBoard'
import ProjectDetails from './pages/Admin/ProjectDetails'
import CreateIssue from './pages/Admin/CreateIssue'
import IssueDetails from './pages/Admin/IssueDetails'
import BurndownChartPage from './pages/Admin/BurndownChartPage'
import EditProject from './pages/Admin/EditProject'
import ProjectIssuesList from './pages/Admin/ProjectIssuesList'
import UserProjectDetails from './pages/User/UserProjectDetails'

function App() {
  const [count, setCount] = useState(0)

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

const AppContent = () => {
  const { user } = useContext(UserContext);

  const handleReceiveMessage = (newMessage) => {
    // You might want to fetch sender's name here if not included in newMessage
    toast.info(`New message from ${newMessage.sender}: ${newMessage.content}`);
  };

  useSocket(handleReceiveMessage);

  return (
    <div >
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        {/* { Admin Routes } */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path='/admin/dashboard' element={<Dashboard />} />
          <Route path='/admin/tasks' element={< ManageTasks />} />
          <Route path='/admin/create-task' element={<CreateTask />} />
          <Route path='/admin/insights' element={<TaskInsightsDashboard />} />
          <Route path='/admin/bulk-operations' element={<BulkOperationsTaskManager />} />
          <Route path='/admin/ai-dashboard' element={<AIDashboard />} />
          <Route path='/admin/users' element={< ManageUsers />} />
          <Route path='/admin/setting' element={<DashboardLayout><UserSettings /></DashboardLayout>} />
          <Route path='/admin/messages' element={<Messages />} />
          <Route path='/admin/notification' element={<NotificationPopup />} />
          <Route path='/admin/projects' element={<ProjectList/>} />
          <Route path='/admin/create-project' element={<CreateProject />} />
          <Route path='/admin/projects/:projectId/kanban' element={<KanbanBoard />} />
          <Route path='/admin/projects/:projectId' element={<ProjectDetails />} />
          <Route path='/admin/projects/:projectId/issues' element={<ProjectIssuesList />} />
          <Route path='/admin/projects/:projectId/create-issue' element={<CreateIssue />} />
          <Route path='/admin/create-issue' element={<CreateIssue />} />
          <Route path='/admin/edit-project/:projectId' element={<EditProject />} />
          <Route path='/admin/projects/:projectId/burndown-chart' element={<BurndownChartPage />} />
          <Route path='/admin/issues/:issueId' element={<IssueDetails />} />
          
        </Route>

        {/* { User Routes } */}
        <Route element={<PrivateRoute allowedRoles={['user', 'member']} />} >
          <Route path='/user/dashboard' element={<UserDashboard />} />
          <Route path='/user/tasks' element={<MyTasks />} />
          <Route path='/user/projects' element={<ProjectList />} />
          <Route path='/user/projects/:projectId' element={<UserProjectDetails />} />
          <Route path='/user/projects/:projectId/kanban' element={<KanbanBoard />} />
          <Route path='/user/projects/:projectId/issues' element={<ProjectIssuesList />} />
          <Route path='/user/tasks/:id' element={<ViewTaskDetails />} />
          <Route path='/user/create-task' element={<CreateTask />} />
          <Route path='/user/tasks/create' element={<CreateTask />} />
          <Route path='/user/users' element={<ManageUsers />} />
          <Route path='/user/setting' element={<DashboardLayout><UserSettings /></DashboardLayout>} />
          <Route path='/user/messages' element={<Messages />} />
          <Route path='/user/notification' element={<NotificationPopup/>} />
        </Route>

        {/* {default Routes} */}
        <Route path='/' element={<Root />} />

      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return user.role === "admin"
    ? <Navigate to="/admin/dashboard" />
    : <Navigate to="/user/dashboard" />;
};