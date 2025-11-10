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
import UserDashboard from './pages/User/userDashboard'
import ViewTaskDetails from './pages/User/ViewTaskDetails'
import UserProvider, { UserContext } from './context/userContext'
import MyTasks from './pages/User/MyTasks'
import ManageUsers from './pages/Admin/ManageUsers'

function App() {
  const [count, setCount] = useState(0)

  return (
    <UserProvider>
      <div >
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* { Admin Routes } */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path='/admin/dashboard' element={<Dashboard />} />
            <Route path='/admin/tasks' element={< ManageTasks />} />
            <Route path='/admin/create-task' element={<CreateTask />} />
            <Route path='/admin/users' element={< ManageUsers />} />
          </Route>

          {/* { User Routes } */}
          <Route element={<PrivateRoute allowedRoles={['user', 'member']} />} >
            <Route path='/user/dashboard' element={<UserDashboard />} />
            <Route path='/user/tasks' element={<MyTasks />} />
            <Route path='/user/tasks/:id' element={<ViewTaskDetails />} />
          </Route>

          {/* {default Routes} */}
          <Route path='/' element={<Root />} />

        </Routes>
      </div>
    </UserProvider>
  )
}

export default App

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return user.role === "admin"
    ? <Navigate to="/admin/dashboard" />
    : <Navigate to="/user/dashboard" />;
};