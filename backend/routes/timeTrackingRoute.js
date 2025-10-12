import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    startTimeTracking,
    stopTimeTracking,
    getActiveTimeTracking,
    getTimeTrackingHistory,
    getTimeTrackingStats,
    updateTimeTracking,
    deleteTimeTracking
} from "../controllers/timeTrackingController.js";

const timeTrackingRouter = express.Router();

// Start/stop time tracking
timeTrackingRouter.route('/start')
    .post(authMiddleware, startTimeTracking);

timeTrackingRouter.route('/stop/:timeTrackingId')
    .put(authMiddleware, stopTimeTracking);

// Get active tracking
timeTrackingRouter.route('/active')
    .get(authMiddleware, getActiveTimeTracking);

// History and stats
timeTrackingRouter.route('/history')
    .get(authMiddleware, getTimeTrackingHistory);

timeTrackingRouter.route('/stats')
    .get(authMiddleware, getTimeTrackingStats);

// Update/delete records
timeTrackingRouter.route('/:timeTrackingId')
    .put(authMiddleware, updateTimeTracking)
    .delete(authMiddleware, deleteTimeTracking);

export default timeTrackingRouter;



















