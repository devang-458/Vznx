import React, { useContext, useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
// Import necessary components from react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Placeholder for IssueCard component
const IssueCard = ({ issue, dragHandleProps }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-3 border border-gray-200 flex items-center">
      <div {...dragHandleProps} className="cursor-grab mr-2 text-gray-400 hover:text-gray-600">
        &#x22EE; {/* Unicode for three vertical dots */}
      </div>
      <div>
        <h4 className="font-semibold text-sm text-gray-800">{issue.title}</h4>
        <p className="text-xs text-gray-600 mt-1">
          Assignee: {issue.assignee?.name || 'Unassigned'}
        </p>
        <p className="text-xs text-gray-500">Priority: {issue.priority}</p>
        {/* Add more issue details as needed */}
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const { projectId } = useParams(); // Get project ID from URL
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('Loading Project...');

  const handleAddTask = (status) => {
    navigate('/admin/create-task-enhanced', { state: { projectId, status } });
  };

  // Fetch project details to get the project name
  const { data: projectData, loading: projectLoading, error: projectError } = useFetchData(
    user && projectId ? API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId) : null,
    { initialData: null, skip: !user || !projectId }
  );

  useEffect(() => {
    if (projectData) {
      setProjectName(projectData.name);
    }
  }, [projectData]);


  // Ensure statuses are stable and don't re-organize based on fetch
  const [statuses] = useState(['To Do', 'In Progress', 'Review', 'Blocked', 'Done']);
  const [issuesByStatus, setIssuesByStatus] = useState(
    statuses.reduce((acc, status) => ({ ...acc, [status]: [] }), {})
  );
  // Fetch issues for the project
  const {
    data: issuesData,
    loading,
    error,
    fetchData: refetchIssues,
  } = useFetchData(
    user && projectId ? API_PATHS.ISSUES.GET_ISSUES_BY_PROJECT(projectId) : null,
    { initialData: [], skip: !user || !projectId }
  );

  useEffect(() => {
    console.log("ji",)
    if (issuesData) {
      // Organize issues by status
      const organized = statuses.reduce((acc, status) => {
        // Initialize each status with an empty array
        acc[status] = issuesData.filter((issue) => issue.status === status);
        return acc;
      }, {});
      setIssuesByStatus(organized);
    }
  }, [issuesData, statuses]);

  // Function to handle status update (will be called by drag and drop)
  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      await axiosInstance.put(API_PATHS.ISSUES.UPDATE_ISSUE_STATUS(issueId), {
        status: newStatus,
      });
      refetchIssues(); // Refetch issues to update the board
    } catch (err) {
      console.error('Failed to update issue status:', err);
      // Optionally show a toast notification
      // We should probably refetch here too to revert the optimistic change on failure
      refetchIssues();
    }
  };

  // Handle the logic after a drag ends
  const onDragEnd = (result) => {
    // console.log('Drag result:', result); // Temporarily added for debugging
    const { destination, source, draggableId } = result;

    // 1. Check if dropped outside a valid area
    if (!destination) {
      return;
    }

    // 2. Check if dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 3. Handle moving to a different column (changing status)
    if (source.droppableId !== destination.droppableId) {
      // Optimistically update the UI for a smooth experience
      setIssuesByStatus((prev) => {
        const sourceColumn = Array.from(prev[source.droppableId]);
        const destColumn = Array.from(prev[destination.droppableId]);

        // Find and remove the issue from the source column
        const [movedIssue] = sourceColumn.splice(source.index, 1);

        // Add the issue to the destination column
        destColumn.splice(destination.index, 0, movedIssue);

        return {
          ...prev,
          [source.droppableId]: sourceColumn,
          [destination.droppableId]: destColumn,
        };
      });

      // Call the API to persist the change
      updateIssueStatus(draggableId, destination.droppableId);
    }
    // 4. Handle re-ordering within the same column
    else {
      const columnId = source.droppableId;
      const column = issuesByStatus[columnId];
      const newColumn = Array.from(column);

      // Remove the item
      const [movedItem] = newColumn.splice(source.index, 1);
      // Insert it at the new position
      newColumn.splice(destination.index, 0, movedItem);

      // Update the state locally for a responsive UI
      setIssuesByStatus((prev) => ({
        ...prev,
        [columnId]: newColumn,
      }));
      // Note: This re-ordering is not persisted to the backend
      // as there's no API call for it in the original code.
    }
  };

  if ((loading && !issuesData.length) || projectLoading) { // Show loading only on initial load
    return (
      <DashboardLayout activeMenu="Kanban Board">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading Kanban board...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || projectError) {
    return (
      <DashboardLayout activeMenu="Kanban Board">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {error?.message || projectError?.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Kanban Board">
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Kanban Board for Project: {projectName}
        </h1>

        {/* Wrap the entire board in DragDropContext */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statuses.map((status) => (
              // Each column is a Droppable area
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-gray-100 rounded-lg p-4 shadow-md transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100' : ''
                      }`}
                  >
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 capitalize flex justify-between items-center">
                      {status}
                      <button
                        className="text-gray-500 hover:text-blue-600 focus:outline-none"
                        // onClick={() => handleAddTask(status)} // To be implemented
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </h2>
                    <div className="min-h-[200px]"> {/* Ensure droppable area has height */}
                      {issuesByStatus[status]?.map((issue, index) => (
                        // Each card is Draggable
                        <Draggable
                          key={String(issue._id)}
                          draggableId={String(issue._id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-shadow ${snapshot.isDragging ? 'shadow-xl' : 'shadow-sm'
                                }`}
                            >
                              <IssueCard issue={issue} dragHandleProps={provided.dragHandleProps} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {/* Placeholder adds space when dragging */}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </DashboardLayout>
  );
};

export default KanbanBoard;