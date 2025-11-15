import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  return allowedRoles.includes(user.role)
    ? <Outlet />
    : <Navigate to="/login" />;
};

export default PrivateRoute;
