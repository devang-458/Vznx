import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from "moment"
import { IoMdCard } from "react-icons/io";
import InfoCard from '../../components/Cards/infoCard';
import { addThousandsSeparator } from '../../utils/helper';
import {
  IoStatsChart,
  IoListCircle,
  IoHourglass,
  IoCheckmarkCircle
} from "react-icons/io5";
import { LuAArrowDown, LuSquareArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import TaskListTable from '../../components/TaskListTable';



const Dashboard = () => {
  useUserAuth();
  const navigate = useNavigate();

  const { user } = useContext(UserContext);

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  // Prepare Chart Data
  const prepareChartData = (date) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "Completed", count: taskPriorityLevels?.Completed || 0 },
    ];
    
    setPieChartData(PriorityLevelData);
  } 


  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts)
      }
    } catch (error) {
      console.log("Error fetching users:", error)
    }
  };
  // useEffect(() => {
  //   getDashboardData();
  // }, [])

  const onSeeMore = () => {
    navigate("/admin/tasks")
  }


  return (<DashboardLayout activeMenu="Dashboard">
    <div className='card my-5'>
      <div>
        <div className='col-span-3'>
          <h2 className='text-xl md:text-2xl'>
            Good Morning
          </h2>
          <p className='text-xs md:text-xs text-gray-400 mt-1.5'>
            {moment().format("dddd  Do  MMM  YYYY")}
          </p>
        </div>
      </div>


      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
        <InfoCard
          icon={<IoStatsChart />}
          label="Total Tasks"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
          color="bg-blue-500"
        />

        <InfoCard
          icon={<IoListCircle />}
          label="Pending"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
          color="bg-yellow-500"
        />

        <InfoCard
          icon={<IoHourglass />}
          label="In Progress"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
          color="bg-cyan-500"
        />

        <InfoCard
          icon={<IoCheckmarkCircle />}
          label="Completed"
          value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
          color="bg-green-500"
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6'>
        <div className='md:col-span-2'>
          <div className='card'>
            <div className='flex items-center justify-between'>
              <h5>Recent Tasks</h5>
            </div>
            <button className='card-btn' onClick={onSeeMore}>
              Sell All <LuSquareArrowRight className='text-base' />
            </button>
          </div>

          <TaskListTable tableData={dashboardData?.recentTasks || []} />
        </div>
      </div>

    </div>
  </DashboardLayout>)
}

export default Dashboard