import Task from "../models/taskModel.js";
import TimeTracking from "../models/timeTrackingModel.js";
import Notification from "../models/notificationModel.js";

// Create a new task
export const createTask = async(req, res) => {
    try{
        const { 
            title, 
            description, 
            priority, 
            category,
            tags,
            dueDate, 
            startDate,
            estimatedTime,
            status,
            isRecurring,
            recurringType,
            recurringInterval,
            parentTask,
            dependencies,
            reminders,
            completed 
        } = req.body;
        
        const task = new Task({
            title,
            description,
            priority: priority || 'Low',
            category: category || 'Other',
            tags: tags || [],
            dueDate,
            startDate,
            estimatedTime: estimatedTime || 0,
            status: status || 'todo',
            isRecurring: isRecurring || false,
            recurringType: recurringType || 'daily',
            recurringInterval: recurringInterval || 1,
            parentTask,
            dependencies: dependencies || [],
            reminders: reminders || [],
            completed: completed === 'Yes' || completed === true,
            owner: req.user.id
        });

        // Set next recurring date if recurring
        if (isRecurring && dueDate) {
            const nextDate = new Date(dueDate);
            switch(recurringType) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + recurringInterval);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + (7 * recurringInterval));
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + recurringInterval);
                    break;
                case 'yearly':
                    nextDate.setFullYear(nextDate.getFullYear() + recurringInterval);
                    break;
            }
            task.nextRecurringDate = nextDate;
        }

        const saved = await task.save();
        res.status(201).json({success: true, task: saved});
    }
    catch(err){
        res.status(400).json({success: false, message: err.message});
    }
};

// Get all tasks with filtering and search
export const getTask = async(req, res) => {
    try{
        const { 
            category, 
            status, 
            priority, 
            search, 
            tags, 
            dueDate,
            archived,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        let query = { owner: req.user.id };
        
        // Add filters
        if (category) query.category = category;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (archived !== undefined) query.archived = archived === 'true';
        if (tags) query.tags = { $in: tags.split(',') };
        if (dueDate) {
            const date = new Date(dueDate);
            query.dueDate = {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lte: new Date(date.setHours(23, 59, 59, 999))
            };
        }
        
        // Add search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const tasks = await Task.find(query)
            .populate('parentTask', 'title')
            .populate('dependencies', 'title')
            .populate('assignedTo', 'name email')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Add default values for backward compatibility
        const tasksWithDefaults = tasks.map(task => ({
            ...task.toObject(),
            category: task.category || 'Other',
            status: task.status || 'todo',
            tags: task.tags || [],
            estimatedTime: task.estimatedTime || 0,
            actualTime: task.actualTime || 0,
            isRecurring: task.isRecurring || false,
            archived: task.archived || false
        }));

        const total = await Task.countDocuments(query);
        
        res.json({
            success: true, 
            tasks: tasksWithDefaults,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    }
    catch(err){
        res.status(500).json({success: false, message: err.message});
    }
}

// Get single task by ID
export const getTaskById = async(req, res) => {
    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id})
            .populate('parentTask', 'title')
            .populate('dependencies', 'title')
            .populate('subtasks', 'title status')
            .populate('assignedTo', 'name email');
            
        if(!task) return res.status(404).json({
            success: false,
            message: "Task not found"
        });
        res.json({success: true, task});
    }
    catch(err){
        res.status(500).json({success: false, message: err.message});
    }
}

// Update a task
export const updateTask = async(req, res) => {
    try{
        const data = { ...req.body};
        if(data.completed !== undefined){
            data.completed = data.completed === 'Yes' || data.completed === true;
            if (data.completed) {
                data.completedAt = new Date();
                data.status = 'done';
            }
        }

        const updated = await Task.findOneAndUpdate(
            {_id: req.params.id, owner: req.user.id},
            data,
            {new: true, runValidators: true}
        ).populate('parentTask', 'title')
         .populate('dependencies', 'title')
         .populate('assignedTo', 'name email');

        if(!updated) return res.status(404).json({
            success: false, message: "Task not found or not yours"
        });
        res.json({ success: true, task: updated});
    }
    catch(err){
        res.status(400).json({success: false, message: err.message});
    }
}

// Delete a task
export const deleteTask = async(req, res) => {
    try {
        const deleted = await Task.findOneAndDelete({_id: req.params.id, owner: req.user.id});

        if(!deleted) return res.status(404).json({ 
            success: false, 
            message: "Task not found or not yours"
        });
        
        // Delete related time tracking records
        await TimeTracking.deleteMany({ task: req.params.id });
        
        res.json({success: true, message: "Task deleted"});
    }
    catch (err){
        res.status(500).json({success: false, message: err.message});
    }
}

// Archive a task
export const archiveTask = async(req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            {_id: req.params.id, owner: req.user.id},
            { archived: true, archivedAt: new Date() },
            {new: true}
        );

        if(!task) return res.status(404).json({
            success: false, message: "Task not found or not yours"
        });
        
        res.json({success: true, task});
    }
    catch (err){
        res.status(500).json({success: false, message: err.message});
    }
}

// Unarchive a task
export const unarchiveTask = async(req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            {_id: req.params.id, owner: req.user.id},
            { archived: false, $unset: { archivedAt: 1 } },
            {new: true}
        );

        if(!task) return res.status(404).json({
            success: false, message: "Task not found or not yours"
        });
        
        res.json({success: true, task});
    }
    catch (err){
        res.status(500).json({success: false, message: err.message});
    }
}

// Get task statistics
export const getTaskStats = async(req, res) => {
    try {
        const userId = req.user.id;
        
        const stats = await Task.aggregate([
            { $match: { owner: userId, archived: { $ne: true } } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    pending: { $sum: { $cond: ['$completed', 0, 1] } },
                    byPriority: {
                        $push: {
                            priority: '$priority',
                            completed: '$completed'
                        }
                    },
                    byCategory: {
                        $push: {
                            category: '$category',
                            completed: '$completed'
                        }
                    },
                    byStatus: {
                        $push: {
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
                    completed: 0,
                    pending: 0,
                    completionRate: 0,
                    byPriority: { Low: 0, Medium: 0, High: 0 },
                    byCategory: {},
                    byStatus: { todo: 0, 'in-progress': 0, review: 0, done: 0 }
                }
            });
        }

        const stat = stats[0];
        const completionRate = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;

        // Process priority stats
        const byPriority = { Low: 0, Medium: 0, High: 0 };
        stat.byPriority.forEach(item => {
            byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
        });

        // Process category stats
        const byCategory = {};
        stat.byCategory.forEach(item => {
            if (!byCategory[item.category]) {
                byCategory[item.category] = { total: 0, completed: 0 };
            }
            byCategory[item.category].total++;
            if (item.completed) byCategory[item.category].completed++;
        });

        // Process status stats
        const byStatus = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
        stat.byStatus.forEach(item => {
            byStatus[item.status] = (byStatus[item.status] || 0) + 1;
        });

        res.json({
            success: true,
            stats: {
                total: stat.total,
                completed: stat.completed,
                pending: stat.pending,
                completionRate,
                byPriority,
                byCategory,
                byStatus
            }
        });
    }
    catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
}

// Search tasks
export const searchTasks = async(req, res) => {
    try {
        const { q, category, status, priority, tags } = req.query;
        const userId = req.user.id;

        let query = { owner: userId, archived: { $ne: true } };

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (tags) query.tags = { $in: tags.split(',') };

        const tasks = await Task.find(query)
            .select('title description priority category status dueDate completed tags')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, tasks });
    }
    catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
}

// Get tasks by category
export const getTasksByCategory = async(req, res) => {
    try {
        const { category } = req.params;
        const tasks = await Task.find({ 
            owner: req.user.id, 
            category,
            archived: { $ne: true }
        }).sort({ createdAt: -1 });

        res.json({ success: true, tasks });
    }
    catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
}

// Get tasks by status
export const getTasksByStatus = async(req, res) => {
    try {
        const { status } = req.params;
        const tasks = await Task.find({ 
            owner: req.user.id, 
            status,
            archived: { $ne: true }
        }).sort({ createdAt: -1 });

        res.json({ success: true, tasks });
    }
    catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
}