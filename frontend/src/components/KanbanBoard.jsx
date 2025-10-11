import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, MoreVertical, Calendar, Clock, Tag } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { format, isToday } from 'date-fns';

const API_BASE = "http://localhost:4000/api/task";

const KanbanBoard = () => {
  const outletContext = useOutletContext();
  const tasks = outletContext?.tasks || [];
  const refreshTask = outletContext?.refreshTask || (() => {});
  const [columns, setColumns] = useState({
    todo: {
      id: 'todo',
      title: 'To Do',
      color: 'bg-gray-100 dark:bg-gray-800',
      textColor: 'text-gray-600 dark:text-gray-400',
      tasks: []
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      color: 'bg-blue-100 dark:bg-blue-900/50',
      textColor: 'text-blue-600 dark:text-blue-400',
      tasks: []
    },
    review: {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-100 dark:bg-yellow-900/50',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      tasks: []
    },
    done: {
      id: 'done',
      title: 'Done',
      color: 'bg-green-100 dark:bg-green-900/50',
      textColor: 'text-green-600 dark:text-green-400',
      tasks: []
    }
  });

  // Organize tasks into columns
  useEffect(() => {
    const organizedColumns = { ...columns };
    
    // Reset all columns
    Object.keys(organizedColumns).forEach(key => {
      organizedColumns[key].tasks = [];
    });

    // Sort tasks into columns based on status
    tasks.forEach(task => {
      let columnId = 'todo'; // default
      
      // Map task status to column IDs
      if (task.completed) {
        columnId = 'done';
      } else if (task.status === 'in-progress' || task.status === 'in_progress' || task.status === 'in progress') {
        columnId = 'in-progress';
      } else if (task.status === 'review' || task.status === 'Review') {
        columnId = 'review';
      } else if (task.status === 'todo' || task.status === 'To Do' || !task.status) {
        columnId = 'todo';
      } else {
        // For any other status, default to todo
        columnId = 'todo';
      }
      
      if (organizedColumns[columnId]) {
        organizedColumns[columnId].tasks.push(task);
      }
    });

    setColumns(organizedColumns);
  }, [tasks]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside any droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const task = sourceColumn.tasks[source.index];

    console.log('Drag and drop:', {
      from: source.droppableId,
      to: destination.droppableId,
      taskId: task._id,
      taskTitle: task.title,
      currentStatus: task.status,
      completed: task.completed
    });

    // Update task status based on destination column
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert('Please login first');
        return;
      }

      let updateData = {};
      
      if (destination.droppableId === 'done') {
        updateData = { completed: true, status: 'completed' };
      } else if (destination.droppableId === 'in-progress') {
        updateData = { completed: false, status: 'in-progress' };
      } else if (destination.droppableId === 'review') {
        updateData = { completed: false, status: 'review' };
      } else if (destination.droppableId === 'todo') {
        updateData = { completed: false, status: 'todo' };
      } else {
        // Default to todo if unknown column
        updateData = { completed: false, status: 'todo' };
      }

      const response = await axios.put(`${API_BASE}/${task._id}/gp`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh tasks
        refreshTask();
      } else {
        alert(response.data.message || 'Error updating task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error updating task status. Please try again.';
      alert(errorMessage);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Work': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      'Personal': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      'Study': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
      'Health': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      'Finance': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
      'Shopping': 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
      'Travel': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
      'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Kanban Board
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop tasks to change their status
        </p>
        {tasks.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">
              No tasks available. Create some tasks first to use the Kanban board.
            </p>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`${column.color} ${column.textColor} p-4 rounded-t-lg border-b border-gray-200 dark:border-gray-700`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    {column.title}
                  </h3>
                  <span className="bg-white dark:bg-gray-800 text-xs px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <div className="mt-2 text-xs opacity-75">
                  Drop tasks here to move to {column.title}
                </div>
              </div>

              {/* Column Content */}
              <Droppable droppableId={column.id} isDropDisabled={false}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 min-h-[500px] transition-colors duration-200 ${
                      snapshot.isDraggingOver
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'bg-white dark:bg-gray-800'
                    } rounded-b-lg border border-gray-200 dark:border-gray-700`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                        isDragDisabled={false}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 ${
                              snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                            }`}
                          >
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-tight">
                                {task.title}
                              </h4>
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>

                            {/* Task Description */}
                            {task.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                                {task.category}
                              </span>
                            </div>

                            {/* Task Footer */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span className={isToday(new Date(task.dueDate)) ? 'text-red-500 font-medium' : ''}>
                                      {isToday(new Date(task.dueDate)) 
                                        ? 'Today' 
                                        : format(new Date(task.dueDate), 'MMM dd')
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {task.createdAt ? format(new Date(task.createdAt), 'MMM dd') : 'No date'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;



