import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { IoAdd, IoEye } from 'react-icons/io5';
import axiosInstance from '../../utils/axiosinstance';
import moment from 'moment';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const STATUS_COLUMNS = ['Pending', 'In Progress', 'Review', 'Completed'];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/tasks');
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const task = tasks.find(t => t._id === draggableId);

    if (!task) return;

    // Optimistic update
    setTasks(
      tasks.map(t =>
        t._id === draggableId ? { ...t, status: newStatus } : t
      )
    );

    // Update backend
    try {
      await axiosInstance.put(`/api/tasks/${draggableId}/status`, {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert on error
      loadTasks();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return '📋';
      case 'In Progress':
        return '⚙️';
      case 'Review':
        return '👀';
      case 'Completed':
        return '✅';
      default:
        return '📌';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading kanban board...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600 mt-1">Drag and drop tasks to update their status</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map(status => (
              <div
                key={status}
                className="shrink-0 w-80 bg-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusIcon(status)}</span>
                    <h2 className="font-bold text-gray-800">{status}</h2>
                  </div>
                  <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {getTasksByStatus(status).length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[500px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-300 bg-opacity-50' : ''
                      } rounded p-2`}
                    >
                      {getTasksByStatus(status).map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-move ${
                                snapshot.isDragging ? 'shadow-lg bg-blue-50' : ''
                              }`}
                              onClick={() => setSelectedTask(task)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-sm text-gray-900 flex-1 pr-2">
                                  {task.title}
                                </h3>
                                <button
                                  className="text-blue-600 hover:text-blue-800 text-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTask(task);
                                  }}
                                >
                                  <IoEye />
                                </button>
                              </div>

                              {task.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span
                                  className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {moment(task.dueDate).format('MMM DD')}
                                </span>
                              </div>

                              {task.assignedTo && task.assignedTo.length > 0 && (
                                <div className="flex -space-x-2 mt-3">
                                  {task.assignedTo.slice(0, 3).map(user => (
                                    <img
                                      key={user._id}
                                      src={user.profileImageUrl || 'https://via.placeholder.com/32'}
                                      alt={user.name}
                                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                      title={user.name}
                                    />
                                  ))}
                                  {task.assignedTo.length > 3 && (
                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-bold">
                                      +{task.assignedTo.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 border-2 border-dashed border-gray-300 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2">
                  <IoAdd /> Add Task
                </button>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedTask.title}</h2>
            <p className="text-gray-600 mb-4">{selectedTask.description}</p>

            <div className="space-y-2 mb-4">
              <p>
                <strong>Priority:</strong>{' '}
                <span className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </p>
              <p>
                <strong>Status:</strong> {selectedTask.status}
              </p>
              <p>
                <strong>Due Date:</strong> {moment(selectedTask.dueDate).format('MMMM DD, YYYY')}
              </p>
              {selectedTask.assignedTo && selectedTask.assignedTo.length > 0 && (
                <p>
                  <strong>Assigned To:</strong> {selectedTask.assignedTo.map(u => u.name).join(', ')}
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedTask(null)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
