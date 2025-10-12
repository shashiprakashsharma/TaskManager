/**
 * Utility functions for task calculations
 */

/**
 * Calculate task completion percentage
 * @param {Array} tasks - Array of task objects
 * @returns {Object} - Object containing completion stats
 */
export const calculateTaskStats = (tasks = []) => {
  const totalTasks = tasks.length;
  
  const completedTasks = tasks.filter((task) => {
    return (
      task.completed === true ||
      task.completed === 1 ||
      (typeof task.completed === "string" && task.completed.toLowerCase() === "yes")
    );
  }).length;

  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionPercentage,
  };
};
