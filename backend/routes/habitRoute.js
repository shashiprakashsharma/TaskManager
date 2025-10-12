import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    createHabit,
    getHabits,
    getHabitById,
    updateHabit,
    deleteHabit,
    completeHabit,
    uncompleteHabit,
    getHabitStats
} from "../controllers/habitController.js";

const habitRouter = express.Router();

// Main habit routes
habitRouter.route('/')
    .get(authMiddleware, getHabits)
    .post(authMiddleware, createHabit);

habitRouter.route('/:id')
    .get(authMiddleware, getHabitById)
    .put(authMiddleware, updateHabit)
    .delete(authMiddleware, deleteHabit);

// Completion routes
habitRouter.route('/:habitId/complete')
    .post(authMiddleware, completeHabit);

habitRouter.route('/:habitId/uncomplete')
    .post(authMiddleware, uncompleteHabit);

// Statistics
habitRouter.route('/stats')
    .get(authMiddleware, getHabitStats);

export default habitRouter;



















