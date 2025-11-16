import React, { useContext } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useParams, useNavigate } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import TaskListTable from '../../components/TaskListTable'; // Assuming TaskListTable can display issues
import Button from '../../components/layouts/Button';
import { IoAddCircle } from 'react-icons/io5';

const ProjectIssuesList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // Fetch project details to display project name
  const { data: projectDetails, loading: projectLoading, error: projectError } = useFetchData(
    user && projectId ? API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId) : null,
    { skip: !user || !projectId }
  );

  // Fetch issues for the project
  const { data: issuesData, loading: issuesLoading, error: issuesError } = useFetchData(
    user && projectId ? API_PATHS.ISSUES.GET_ISSUES_BY_PROJECT(projectId) : null,
    { initialData: [], skip: !user || !projectId }
  );

  const handleCreateIssue = () => {
    navigate(`/admin/projects/${projectId}/create-issue`);
  };

  if (projectLoading || issuesLoading) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading issues...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (projectError || issuesError) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {projectError?.message || issuesError?.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Projects">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Issues for Project: {projectDetails?.name || 'Loading...'}</h1>
          <Button
            onClick={handleCreateIssue}
            variant="primary"
            className="flex items-center gap-2"
          >
            <IoAddCircle /> Create New Issue
          </Button>
        </div>

        {issuesData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📂</div>
            <p className="text-gray-500 text-lg">No issues found for this project.</p>
            <p className="text-gray-400 text-sm mt-2">
              Start by creating your first issue!
            </p>
          </div>
        ) : (
          <TaskListTable tableData={issuesData} onRowClick={(issue) => navigate(`/admin/issues/${issue._id}`)} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectIssuesList;
