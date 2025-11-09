import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from "moment"

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Error fetching users:", error)
    }
  };
  // useEffect(() => {
  //   getDashboardData();
  // }, [])

  return (<DashboardLayout activeMenu="Dashboard">
    <div className='card my-5'>
      <div>
        <div className='col-span-3'>
          <h2 className='text-xl md:text-2xl'>
            Good Morning
          </h2>
          <p className='text-xs md:text-xs text-gray-400 mt-1.5'>
            {moment().format("added DD MMM YYYY")}
          </p>
        </div>
      </div>
    </div>
  </DashboardLayout>)
}

export default Dashboard