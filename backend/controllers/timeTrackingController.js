import TimeTracking from "../models/timeTrackingModel.js";
import Task from "../models/taskModel.js";
import memoryStorage from "../utils/memoryStorage.js";
import mongoose from "mongoose";

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Helper function to get the appropriate storage method
const getStorage = () => {
    return isMongoConnected() ? { TimeTracking, Task } : memoryStorage;
};

// Helper function to get the appropriate model
const getModel = (modelName) => {
    if (isMongoConnected()) {
        return modelName === 'TimeTracking' ? TimeTracking : Task;
    } else {
        return memoryStorage;
    }
};

// Start time tracking for a task
export const startTimeTracking = async(req, res) => {
    try {
        const { taskId, description } = req.body;
        const userId = req.user.id;

        console.log('Starting time tracking for:', { taskId, userId, description });

        // Check if task exists and belongs to user
        let task;
        if (isMongoConnected()) {
            task = await Task.findOne({ _id: taskId, owner: userId });
        } else {
            // For memory storage, we need to get tasks from the frontend context
            // Since we don't have tasks in memory storage, we'll create a mock task
            task = { _id: taskId, owner: userId, title: 'Task from Frontend' };
            console.log('Using memory storage - task:', task);
        }
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Stop any active tracking for this user
        if (isMongoConnected()) {
            await TimeTracking.updateMany(
                { user: userId, isActive: true },
                { 
                    isActive: false, 
                    endTime: new Date(),
                    duration: 0
                }
            );
        } else {
            // Update existing active tracking in memory storage
            const activeTrackings = memoryStorage.data.timeTrackings.filter(
                t => t.user === userId && t.isActive
            );
            activeTrackings.forEach(tracking => {
                tracking.isActive = false;
                tracking.endTime = new Date();
                tracking.duration = 0;
            });
            console.log('Stopped active trackings:', activeTrackings.length);
        }

        // Create new time tracking record
        const timeTrackingData = {
            task: taskId,
            user: userId,
            startTime: new Date(),
            description: description || '',
            isActive: true
        };

        let saved;
        if (isMongoConnected()) {
            const timeTracking = new TimeTracking(timeTrackingData);
            saved = await timeTracking.save();
        } else {
            saved = await memoryStorage.create('timeTrackings', timeTrackingData);
            console.log('Created time tracking in memory:', saved);
        }

        res.status(201).json({ success: true, timeTracking: saved });
    }
    catch (err) {
        console.error('Error in startTimeTracking:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// Stop time tracking
export const stopTimeTracking = async(req, res) => {
    try {
        const { timeTrackingId } = req.params;
        const userId = req.user.id;

        console.log('Stopping time tracking:', { timeTrackingId, userId });

        let timeTracking;
        if (isMongoConnected()) {
            timeTracking = await TimeTracking.findOne({
                _id: timeTrackingId,
                user: userId,
                isActive: true
            });
        } else {
            // Find in memory storage
            timeTracking = memoryStorage.data.timeTrackings.find(
                t => t._id === timeTrackingId && t.user === userId && t.isActive
            );
            console.log('Found time tracking in memory:', timeTracking);
        }

        if (!timeTracking) {
            return res.status(404).json({
                success: false,
                message: "Active time tracking not found"
            });
        }

        const endTime = new Date();
        const duration = Math.round((endTime - new Date(timeTracking.startTime)) / (1000 * 60)); // in minutes

        const updateData = {
            endTime: endTime,
            duration: duration,
            isActive: false
        };

        let updated;
        if (isMongoConnected()) {
            timeTracking.endTime = endTime;
            timeTracking.duration = duration;
            timeTracking.isActive = false;
            updated = await timeTracking.save();
        } else {
            // Update in memory storage
            const index = memoryStorage.data.timeTrackings.findIndex(t => t._id === timeTrackingId);
            if (index !== -1) {
                memoryStorage.data.timeTrackings[index] = {
                    ...memoryStorage.data.timeTrackings[index],
                    ...updateData
                };
                updated = memoryStorage.data.timeTrackings[index];
            }
            console.log('Updated time tracking in memory:', updated);
        }

        // Update task's actual time (if using MongoDB)
        if (isMongoConnected()) {
            await Task.findByIdAndUpdate(
                timeTracking.task,
                { $inc: { actualTime: duration } }
            );
        }

        res.json({ success: true, timeTracking: updated });
    }
    catch (err) {
        console.error('Error in stopTimeTracking:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get current active time tracking
export const getActiveTimeTracking = async(req, res) => {
    try {
        const userId = req.user.id;

        let activeTracking;
        if (isMongoConnected()) {
            activeTracking = await TimeTracking.findOne({
                user: userId,
                isActive: true
            }).populate('task', 'title description');
        } else {
            // Find active tracking in memory storage
            activeTracking = memoryStorage.data.timeTrackings.find(
                t => t.user === userId && t.isActive
            );
            
            console.log('Active tracking from memory:', activeTracking);
            
            // If using memory storage, we need to populate the task manually
            if (activeTracking) {
                activeTracking.task = { 
                    _id: activeTracking.task, 
                    title: 'Task from Frontend',
                    description: 'Task description'
                };
            }
        }

        if (!activeTracking) {
            return res.json({ success: true, timeTracking: null });
        }

        res.json({ success: true, timeTracking: activeTracking });
    }
    catch (err) {
        console.error('Error in getActiveTimeTracking:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get time tracking history
export const getTimeTrackingHistory = async(req, res) => {
    try {
        const { taskId, startDate, endDate, page = 1, limit = 20 } = req.query;
        const userId = req.user.id;

        let query = { user: userId, isActive: false };

        if (taskId) query.task = taskId;
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        const timeTrackings = await TimeTracking.find(query)
            .populate('task', 'title description category')
            .sort({ startTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await TimeTracking.countDocuments(query);

        res.json({
            success: true,
            timeTrackings,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get time tracking statistics
export const getTimeTrackingStats = async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        let matchQuery = { user: userId, isActive: false };
        if (startDate || endDate) {
            matchQuery.startTime = {};
            if (startDate) matchQuery.startTime.$gte = new Date(startDate);
            if (endDate) matchQuery.startTime.$lte = new Date(endDate);
        }

        const stats = await TimeTracking.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'tasks',
                    localField: 'task',
                    foreignField: '_id',
                    as: 'task'
                }
            },
            { $unwind: '$task' },
            {
                $group: {
                    _id: null,
                    totalTime: { $sum: '$duration' },
                    totalSessions: { $sum: 1 },
                    avgSessionTime: { $avg: '$duration' },
                    byTask: {
                        $push: {
                            taskId: '$task._id',
                            taskTitle: '$task.title',
                            taskCategory: '$task.category',
                            duration: '$duration'
                        }
                    },
                    byCategory: {
                        $push: {
                            category: '$task.category',
                            duration: '$duration'
                        }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                stats: {
                    totalTime: 0,
                    totalSessions: 0,
                    avgSessionTime: 0,
                    byTask: [],
                    byCategory: {}
                }
            });
        }

        const stat = stats[0];

        // Process by task
        const taskMap = {};
        stat.byTask.forEach(item => {
            if (!taskMap[item.taskId]) {
                taskMap[item.taskId] = {
                    taskId: item.taskId,
                    taskTitle: item.taskTitle,
                    taskCategory: item.taskCategory,
                    totalTime: 0,
                    sessions: 0
                };
            }
            taskMap[item.taskId].totalTime += item.duration;
            taskMap[item.taskId].sessions += 1;
        });

        // Process by category
        const categoryMap = {};
        stat.byCategory.forEach(item => {
            categoryMap[item.category] = (categoryMap[item.category] || 0) + item.duration;
        });

        res.json({
            success: true,
            stats: {
                totalTime: stat.totalTime,
                totalSessions: stat.totalSessions,
                avgSessionTime: Math.round(stat.avgSessionTime),
                byTask: Object.values(taskMap),
                byCategory: categoryMap
            }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update time tracking record
export const updateTimeTracking = async(req, res) => {
    try {
        const { timeTrackingId } = req.params;
        const { description, duration } = req.body;
        const userId = req.user.id;

        const timeTracking = await TimeTracking.findOne({
            _id: timeTrackingId,
            user: userId
        });

        if (!timeTracking) {
            return res.status(404).json({
                success: false,
                message: "Time tracking record not found"
            });
        }

        if (description !== undefined) timeTracking.description = description;
        if (duration !== undefined) timeTracking.duration = duration;

        const updated = await timeTracking.save();
        res.json({ success: true, timeTracking: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete time tracking record
export const deleteTimeTracking = async(req, res) => {
    try {
        const { timeTrackingId } = req.params;
        const userId = req.user.id;

        const timeTracking = await TimeTracking.findOne({
            _id: timeTrackingId,
            user: userId
        });

        if (!timeTracking) {
            return res.status(404).json({
                success: false,
                message: "Time tracking record not found"
            });
        }

        // Subtract time from task if it was completed
        if (timeTracking.duration > 0) {
            await Task.findByIdAndUpdate(
                timeTracking.task,
                { $inc: { actualTime: -timeTracking.duration } }
            );
        }

        await TimeTracking.findByIdAndDelete(timeTrackingId);
        res.json({ success: true, message: "Time tracking record deleted" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



