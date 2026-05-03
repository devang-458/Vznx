import React, { useState, useContext, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
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
import moment from 'moment';

const BurndownChartPage = () => {
  const { user } = useContext(UserContext);
  const { projectId: projectIdFromParams } = useParams();
  const [searchParams] = useSearchParams();

  const [projectId, setProjectId] = useState(projectIdFromParams || searchParams.get('projectId') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || moment().subtract(14, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || moment().format('YYYY-MM-DD'));
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const { data: projectsData, loading: projectsLoading } = useFetchData(
    user ? API_PATHS.PROJECTS.GET_ALL_PROJECTS : null,
    { initialData: [], skip: !user }
  );

  const { data: burndownData, loading: burndownLoading, error: burndownError } = useFetchData(
    user && projectId && startDate && endDate ? API_PATHS.REPORTS.GET_BURNDOWN_CHART_DATA(projectId, startDate, endDate) : null,
    { initialData: [], skip: !user || !projectId || !startDate || !endDate, dependencies: [fetchTrigger] }
  );

  const handleFetchData = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const chartData = useMemo(() => {
    if (!burndownData || burndownData.length === 0) return [];

    const totalPoints = burndownData[0]?.remainingStoryPoints || 0;
    const days = burndownData.length;
    
    return burndownData.map((dataPoint, index) => {
      // Calculate ideal burn
      const idealBurn = totalPoints - (totalPoints / (days - 1)) * index;
      
      return {
        date: moment(dataPoint.date).format('MMM DD'),
        'Actual Remaining': dataPoint.remainingStoryPoints,
        'Ideal Burn': Math.max(0, Math.round(idealBurn * 10) / 10),
      };
    });
  }, [burndownData]);

  return (
    <DashboardLayout activeMenu="Reports">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 text-[#2563eb]">Sprint Burndown Report</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#2563eb] outline-none bg-white"
              >
                <option value="">-- Choose Project --</option>
                {projectsData.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button 
                onClick={handleFetchData} 
                disabled={burndownLoading || !projectId}
                className="bg-[#2563eb] px-10"
              >
                {burndownLoading ? 'Loading...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 min-h-[500px] flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Burndown Velocity</h2>
          
          {burndownError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500">
              <p>Failed to load burndown data.</p>
              <p className="text-sm">{burndownError.message}</p>
            </div>
          ) : burndownLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="flex-1 w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="Ideal Burn" 
                    stroke="#d1d5db" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Actual Remaining" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <p className="text-lg">No data to display</p>
              <p className="text-sm">Select a project and date range to view the burndown chart.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BurndownChartPage;
