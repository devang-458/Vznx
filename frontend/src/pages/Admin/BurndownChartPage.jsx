import React, { useState, useContext, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { useParams, useSearchParams } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import Button from '../../components/layouts/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BurndownChartPage = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const { projectId: projectIdFromParams } = useParams();
  const [searchParams] = useSearchParams();

  const [projectId, setProjectId] = useState(projectIdFromParams || searchParams.get('projectId') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || new Date().toISOString().split('T')[0]);
  const [fetchTrigger, setFetchTrigger] = useState(0); // To manually trigger refetch

  // Fetch projects for dropdown
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useFetchData(
    user ? API_PATHS.PROJECTS.GET_ALL_PROJECTS : null,
    { initialData: [], skip: !user }
  );

  // Fetch burndown data
  const { data: burndownData, loading: burndownLoading, error: burndownError } = useFetchData(
    user && projectId && startDate && endDate ? API_PATHS.REPORTS.GET_BURNDOWN_CHART_DATA(projectId, startDate, endDate) : null,
    { initialData: [], skip: !user || !projectId || !startDate || !endDate, dependencies: [fetchTrigger] }
  );

  const handleFetchData = () => {
    setFetchTrigger(prev => prev + 1);
  };

  // Prepare data for Recharts
  const chartData = Array.isArray(burndownData) ? burndownData.map(dataPoint => ({
    date: new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Remaining Story Points': dataPoint.remainingStoryPoints,
  })) : [];

  return (
    <DashboardLayout activeMenu="Reports">
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sprint Burndown Chart</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Burndown Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              {projectsLoading ? (
                <p className="text-gray-500">Loading projects...</p>
              ) : projectsError ? (
                <p className="text-red-500">Error loading projects.</p>
              ) : (
                <select
                  id="projectSelect"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="input-field w-full"
                  required
                >
                  <option value="">Select a Project</option>
                  {projectsData.map((proj) => (
                    <option key={proj._id} value={proj._id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                required
              />
            </div>
          </div>
          <Button
            onClick={handleFetchData}
            disabled={burndownLoading || !projectId || !startDate || !endDate}
            variant="primary"
          >
            {burndownLoading ? 'Loading Chart...' : 'Generate Chart'}
          </Button>
        </div>

        {burndownLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : burndownError ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Error: {burndownError.message}</p>
          </div>
        ) : burndownData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📊</div>
            <p className="text-gray-500 text-lg">No burndown data available for the selected period.</p>
            <p className="text-gray-400 text-sm mt-2">Adjust your filters and try again.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Burndown Chart</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Remaining Story Points"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BurndownChartPage;
