import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    createGoal,
    getGoals,
    getGoalById,
    updateGoal,
    deleteGoal,
    addProgress,
    addMilestone,
    updateMilestone,
    linkTask,
    linkHabit,
    shareGoal,
    getGoalStats
} from "../controllers/goalController.js";

const goalRouter = express.Router();

// Main goal routes
goalRouter.route('/')
    .get(authMiddleware, getGoals)
    .post(authMiddleware, createGoal);

goalRouter.route('/:id')
    .get(authMiddleware, getGoalById)
    .put(authMiddleware, updateGoal)
    .delete(authMiddleware, deleteGoal);

// Progress routes
goalRouter.route('/:goalId/progress')
    .post(authMiddleware, addProgress);

// Milestone routes
goalRouter.route('/:goalId/milestones')
    .post(authMiddleware, addMilestone);

goalRouter.route('/:goalId/milestones/:milestoneId')
    .put(authMiddleware, updateMilestone);

// Linking routes
goalRouter.route('/:goalId/link/task')
    .post(authMiddleware, linkTask);

goalRouter.route('/:goalId/link/habit')
    .post(authMiddleware, linkHabit);

// Sharing
goalRouter.route('/:goalId/share')
    .post(authMiddleware, shareGoal);

// Statistics
goalRouter.route('/stats')
    .get(authMiddleware, getGoalStats);

export default goalRouter;



















