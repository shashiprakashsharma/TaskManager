import Goal from "../models/goalModel.js";
import Task from "../models/taskModel.js";
import Habit from "../models/habitModel.js";

// Create a new goal
export const createGoal = async(req, res) => {
    try {
        const {
            title,
            description,
            category,
            type,
            targetValue,
            unit,
            startDate,
            targetDate,
            priority,
            color,
            icon,
            milestones,
            isPublic
        } = req.body;

        const goal = new Goal({
            title,
            description,
            category: category || 'Personal',
            type: type || 'target',
            targetValue,
            unit: unit || 'points',
            startDate: startDate || new Date(),
            targetDate,
            priority: priority || 'Medium',
            color: color || '#10B981',
            icon: icon || '🎯',
            milestones: milestones || [],
            isPublic: isPublic || false,
            owner: req.user.id
        });

        const saved = await goal.save();
        res.status(201).json({ success: true, goal: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all goals for user
export const getGoals = async(req, res) => {
    try {
        const { category, type, status, priority } = req.query;
        const userId = req.user.id;

        let query = { owner: userId };
        if (category) query.category = category;
        if (type) query.type = type;
        if (status) query.status = status;
        if (priority) query.priority = priority;

        const goals = await Goal.find(query)
            .populate('tasks', 'title status completed')
            .populate('habits', 'title streak')
            .sort({ createdAt: -1 });

        res.json({ success: true, goals });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single goal by ID
export const getGoalById = async(req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            $or: [
                { owner: req.user.id },
                { sharedWith: req.user.id }
            ]
        })
        .populate('tasks', 'title description status completed dueDate')
        .populate('habits', 'title frequency streak')
        .populate('sharedWith', 'name email');

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        res.json({ success: true, goal });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update goal
export const updateGoal = async(req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            req.body,
            { new: true, runValidators: true }
        )
        .populate('tasks', 'title status completed')
        .populate('habits', 'title streak');

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        res.json({ success: true, goal });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete goal
export const deleteGoal = async(req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        res.json({ success: true, message: "Goal deleted" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Add progress to goal
export const addProgress = async(req, res) => {
    try {
        const { goalId } = req.params;
        const { value, notes } = req.body;
        const userId = req.user.id;

        const goal = await Goal.findOne({
            _id: goalId,
            owner: req.user.id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        goal.progress.push({
            date: new Date(),
            value,
            notes,
            createdAt: new Date()
        });

        // Update current value
        goal.currentValue += value;

        // Check if goal is completed
        if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
            goal.status = 'completed';
            goal.completedAt = new Date();
        }

        const saved = await goal.save();
        res.json({ success: true, goal: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Add milestone to goal
export const addMilestone = async(req, res) => {
    try {
        const { goalId } = req.params;
        const { title, description, targetValue, targetDate } = req.body;
        const userId = req.user.id;

        const goal = await Goal.findOne({
            _id: goalId,
            owner: req.user.id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        goal.milestones.push({
            title,
            description,
            targetValue: targetValue || 0,
            targetDate: targetDate ? new Date(targetDate) : null,
            createdAt: new Date()
        });

        const saved = await goal.save();
        res.json({ success: true, goal: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update milestone
export const updateMilestone = async(req, res) => {
    try {
        const { goalId, milestoneId } = req.params;
        const { title, description, targetValue, currentValue, targetDate, completed } = req.body;
        const userId = req.user.id;

        const goal = await Goal.findOne({
            _id: goalId,
            owner: req.user.id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        const milestone = goal.milestones.id(milestoneId);
        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: "Milestone not found"
            });
        }

        if (title !== undefined) milestone.title = title;
        if (description !== undefined) milestone.description = description;
        if (targetValue !== undefined) milestone.targetValue = targetValue;
        if (currentValue !== undefined) milestone.currentValue = currentValue;
        if (targetDate !== undefined) milestone.targetDate = targetDate ? new Date(targetDate) : null;
        if (completed !== undefined) {
            milestone.completed = completed;
            if (completed) {
                milestone.completedAt = new Date();
            }
        }

        const saved = await goal.save();
        res.json({ success: true, goal: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Link task to goal
export const linkTask = async(req, res) => {
    try {
        const { goalId } = req.params;
        const { taskId } = req.body;
        const userId = req.user.id;

        // Check if goal exists and belongs to user
        const goal = await Goal.findOne({
            _id: goalId,
            owner: req.user.id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        // Check if task exists and belongs to user
        const task = await Task.findOne({
            _id: taskId,
            owner: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Add task to goal if not already linked
        if (!goal.tasks.includes(taskId)) {
            goal.tasks.push(taskId);
            await goal.save();
        }

        res.json({ success: true, message: "Task linked to goal" });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Link habit to goal
export const linkHabit = async(req, res) => {
    try {
        const { goalId } = req.params;
        const { habitId } = req.body;
        const userId = req.user.id;

        // Check if goal exists and belongs to user
        const goal = await Goal.findOne({
            _id: goalId,
            owner: req.user.id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        // Check if habit exists and belongs to user
        const habit = await Habit.findOne({
            _id: habitId,
            owner: req.user.id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        // Add habit to goal if not already linked
        if (!goal.habits.includes(habitId)) {
            goal.habits.push(habitId);
            await goal.save();
        }

        res.json({ success: true, message: "Habit linked to goal" });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Share goal with other users
export const shareGoal = async(req, res) => {
    try {
        const { goalId } = req.params;
        const { userIds } = req.body;
        const ownerId = req.user.id;

        const goal = await Goal.findOne({
            _id: goalId,
            owner: ownerId
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found"
            });
        }

        // Add users to sharedWith array
        userIds.forEach(userId => {
            if (!goal.sharedWith.includes(userId)) {
                goal.sharedWith.push(userId);
            }
        });

        const saved = await goal.save();
        res.json({ success: true, goal: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get goal statistics
export const getGoalStats = async(req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Goal.aggregate([
            { $match: { owner: userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    paused: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    byCategory: {
                        $push: {
                            category: '$category',
                            status: '$status'
                        }
                    },
                    byPriority: {
                        $push: {
                            priority: '$priority',
                            status: '$status'
                        }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                stats: {
                    total: 0,
                    active: 0,
                    completed: 0,
                    paused: 0,
                    cancelled: 0,
                    completionRate: 0,
                    byCategory: {},
                    byPriority: {}
                }
            });
        }

        const stat = stats[0];
        const completionRate = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;

        // Process by category
        const byCategory = {};
        stat.byCategory.forEach(item => {
            if (!byCategory[item.category]) {
                byCategory[item.category] = { total: 0, active: 0, completed: 0, paused: 0, cancelled: 0 };
            }
            byCategory[item.category].total++;
            byCategory[item.category][item.status]++;
        });

        // Process by priority
        const byPriority = {};
        stat.byPriority.forEach(item => {
            if (!byPriority[item.priority]) {
                byPriority[item.priority] = { total: 0, active: 0, completed: 0, paused: 0, cancelled: 0 };
            }
            byPriority[item.priority].total++;
            byPriority[item.priority][item.status]++;
        });

        res.json({
            success: true,
            stats: {
                total: stat.total,
                active: stat.active,
                completed: stat.completed,
                paused: stat.paused,
                cancelled: stat.cancelled,
                completionRate,
                byCategory,
                byPriority
            }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



















