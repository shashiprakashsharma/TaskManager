import express from "express";
import authMiddleware from "../middleware/auth.js";
import { 
    createTask, 
    deleteTask, 
    getTaskById, 
    getTask, 
    updateTask,
    archiveTask,
    unarchiveTask,
    getTaskStats,
    searchTasks,
    getTasksByCategory,
    getTasksByStatus
} from "../controllers/taskController.js";

const taskRouter = express.Router();

// Main task routes
taskRouter.route('/gp')
    .get(authMiddleware, getTask)
    .post(authMiddleware, createTask);

taskRouter.route('/:id/gp')
    .get(authMiddleware, getTaskById)
    .put(authMiddleware, updateTask)
    .delete(authMiddleware, deleteTask);

// Archive routes
taskRouter.route('/:id/archive')
    .put(authMiddleware, archiveTask);

taskRouter.route('/:id/unarchive')
    .put(authMiddleware, unarchiveTask);

// Statistics and search
taskRouter.route('/stats')
    .get(authMiddleware, getTaskStats);

taskRouter.route('/search')
    .get(authMiddleware, searchTasks);

// Category and status routes
taskRouter.route('/category/:category')
    .get(authMiddleware, getTasksByCategory);

taskRouter.route('/status/:status')
    .get(authMiddleware, getTasksByStatus);

export default taskRouter;