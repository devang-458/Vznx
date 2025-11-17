import React, { useContext, useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from '../../components/Cards/TaskCard'; // Import the new TaskCard
import TaskDetailModal from '../../components/TaskDetailModal'; // Import TaskDetailModal

const KanbanBoard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('Loading Project...');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Fetch project details to get the project name and its tasks
  const { data: projectData, loading: projectLoading, error: projectError, fetchData: refetchProject } = useFetchData(
    user && projectId ? API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId) : null,
    { 
      initialData: null, 
      skip: !user || !projectId,
      // Ensure tasks are populated from the backend
      axiosConfig: { params: { populate: 'tasks' } }
    }
  );

  // Define the columns for the Kanban board
  const [statuses] = useState(['To Do', 'In Progress', 'Review', 'Completed']);
  const [tasksByStatus, setTasksByStatus] = useState(
    statuses.reduce((acc, status) => ({ ...acc, [status]: [] }), {})
  );

  useEffect(() => {
    if (projectData && Array.isArray(projectData.tasks)) {
      setProjectName(projectData.name);
      // Organize the project's tasks by their status
      const organizedTasks = statuses.reduce((acc, status) => {
        acc[status] = projectData.tasks.filter((task) => task.status === status) || [];
        return acc;
      }, {});
      setTasksByStatus(organizedTasks);
    } else if (projectData && !projectData.tasks) {
      // If projectData exists but tasks is null/undefined, initialize with empty arrays
      setProjectName(projectData.name);
      const organizedTasks = statuses.reduce((acc, status) => ({ ...acc, [status]: [] }), {});
      setTasksByStatus(organizedTasks);
    }
  }, [projectData, statuses]);

  // Function to handle task status updates via API
  const updateTaskStatus = async (taskId, newStatus) => {
    console.log(`Frontend: Attempting to update task ${taskId} to status ${newStatus}`);
    try {
      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId), {
        status: newStatus,
      });
      console.log(`Frontend: Task ${taskId} status updated successfully to ${newStatus}`);
      // No need to refetch, optimistic update is smoother
    } catch (err) {
      console.error(`Frontend: Failed to update task ${taskId} status to ${newStatus}:`, err);
      // On error, refetch to revert the optimistic UI change
      refetchProject();
    }
  };

  const { data: users, loading: usersLoading, error: usersError } = useFetchData(
    user ? API_PATHS.USERS.GET_ALL_USERS : null,
    { initialData: [], skip: !user }
  );

  // Function to handle assignee changes
  const handleAssigneeChange = async (taskId, newAssigneeId) => {
    try {
      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), {
        assignedTo: newAssigneeId ? [newAssigneeId] : [],
      });
      // Refetch project data to update the UI with the new assignee
      refetchProject();
    } catch (err) {
      console.error('Failed to update task assignee:', err);
    }
  };

  // Handle the logic after a drag-and-drop action ends
  const onDragEnd = (result) => {
    try {
        const { destination, source, draggableId } = result;

        if (!destination) {
        return;
        }

        if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
        ) {
        return;
        }

        const start = tasksByStatus[source.droppableId];
        const end = tasksByStatus[destination.droppableId];

        if (!start || !end) {
            console.error("Start or end column not found");
            return;
        }

        if (start === end) {
        const newTasks = Array.from(start);
        const [reorderedItem] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, reorderedItem);

        const newTasksByStatus = {
            ...tasksByStatus,
            [source.droppableId]: newTasks,
        };
        setTasksByStatus(newTasksByStatus);
        } else {
        const startTasks = Array.from(start);
        const [movedItem] = startTasks.splice(source.index, 1);
        const endTasks = Array.from(end);
        endTasks.splice(destination.index, 0, movedItem);

        const newTasksByStatus = {
            ...tasksByStatus,
            [source.droppableId]: startTasks,
            [destination.droppableId]: endTasks,
        };
        setTasksByStatus(newTasksByStatus);
        }
        updateTaskStatus(draggableId, destination.droppableId);
    } catch (error) {
        console.error("Error in onDragEnd:", error);
        refetchProject();
    }
  };

  const handleTaskCardClick = (taskId) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleTaskUpdate = (updatedTask) => {
    // Update the tasks in the state to reflect changes from the modal
    setTasksByStatus(prev => {
      const newTasksByStatus = { ...prev };
      // Find the task in its current status column and update it
      for (const statusKey in newTasksByStatus) {
        const taskIndex = newTasksByStatus[statusKey].findIndex(task => task._id === updatedTask._id);
        if (taskIndex !== -1) {
          // If status changed, move it to the new column
          if (newTasksByStatus[statusKey][taskIndex].status !== updatedTask.status) {
            newTasksByStatus[statusKey].splice(taskIndex, 1); // Remove from old column
            newTasksByStatus[updatedTask.status] = [...(newTasksByStatus[updatedTask.status] || []), updatedTask]; // Add to new column
          } else {
            newTasksByStatus[statusKey][taskIndex] = updatedTask; // Update in same column
          }
          return newTasksByStatus;
        }
      }
      return newTasksByStatus;
    });
    refetchProject(); // Also refetch the project to ensure full data consistency
  };


  if (projectLoading || usersLoading) {
    return (
      <DashboardLayout activeMenu="Kanban Board">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading Kanban board...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (projectError || usersError) {
    return (
      <DashboardLayout activeMenu="Kanban Board">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {projectError?.message || usersError?.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Kanban Board">
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {projectName}
        </h1>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statuses.map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-gray-100 rounded-lg p-4 shadow-md transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100' : ''}`}
                  >
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                      {status} ({tasksByStatus[status]?.length || 0})
                    </h2>
                    <div className="min-h-[300px]">
                      {Array.isArray(tasksByStatus[status]) && tasksByStatus[status].map((task, index) => (
                        <Draggable
                          key={String(task._id)}
                          draggableId={String(task._id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-shadow ${snapshot.isDragging ? 'shadow-xl' : 'shadow-sm'}`}
                              onClick={() => handleTaskCardClick(task._id)} // Add onClick handler
                            >
                              <TaskCard task={task} dragHandleProps={provided.dragHandleProps} users={users} onAssigneeChange={handleAssigneeChange} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
      {selectedTaskId && (
        <TaskDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          taskId={selectedTaskId}
          onTaskUpdate={handleTaskUpdate}
          users={users}
          onAssigneeChange={handleAssigneeChange}
        />
      )}
    </DashboardLayout>
  );
};

export default KanbanBoard;