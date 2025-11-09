import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const UserDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);

  return <DashboardLayout>Dashboard</DashboardLayout>
}

export default UserDashboard