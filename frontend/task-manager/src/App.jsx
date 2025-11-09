import { useState } from 'react'
import './App.css'
import {
  BrowserRouter,
  Routes,
  Route,
  Router
} from 'react-router-dom'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Admin/Dashboard'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import PrivateRoute from './routes/PrivateRoute'
import UserDashboard from './pages/User/userDashboard'
import ViewTaskDetails from './pages/User/ViewTaskDetails'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div >
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />

          {/* { Admin Routes } */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path='/admin/dashboard' element={<Dashboard />} />
            <Route path='/admin/tasks' element={<ManageTasks />} />
            <Route path='/admin/create-task' element={<CreateTask />} />
            <Route path='/admin/users' element={< ManageTasks />} />
          </Route>

          {/* { User Routes } */}
          <Route element={<PrivateRoute allowedRoles={['user']} />} >
            <Route path='/user/dashboard' element={<UserDashboard />} />
            <Route path='/user/tasks' element={<ManageTasks />} />
            <Route path='/user/task-details/:id' element={<ViewTaskDetails />} />
          </Route>

        </Routes>
      </div>
    </>
  )
}

export default App
