import Habit from "../models/habitModel.js";

// Create a new habit
export const createHabit = async(req, res) => {
    try {
        const {
            title,
            description,
            category,
            frequency,
            targetValue,
            unit,
            color,
            icon,
            reminders
        } = req.body;

        const habit = new Habit({
            title,
            description,
            category: category || 'Personal',
            frequency: frequency || 'daily',
            targetValue: targetValue || 1,
            unit: unit || 'times',
            color: color || '#8B5CF6',
            icon: icon || '🎯',
            reminders: reminders || [],
            owner: req.user.id
        });

        const saved = await habit.save();
        res.status(201).json({ success: true, habit: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all habits for user
export const getHabits = async(req, res) => {
    try {
        const { category, frequency, isActive } = req.query;
        const userId = req.user.id;

        let query = { owner: userId };
        if (category) query.category = category;
        if (frequency) query.frequency = frequency;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const habits = await Habit.find(query).sort({ createdAt: -1 });
        res.json({ success: true, habits });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single habit by ID
export const getHabitById = async(req, res) => {
    try {
        const habit = await Habit.findOne({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        res.json({ success: true, habit });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update habit
export const updateHabit = async(req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        res.json({ success: true, habit });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete habit
export const deleteHabit = async(req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        res.json({ success: true, message: "Habit deleted" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Mark habit as completed for a date
export const completeHabit = async(req, res) => {
    try {
        const { habitId } = req.params;
        const { date, value = 1, notes } = req.body;
        const userId = req.user.id;

        const habit = await Habit.findOne({
            _id: habitId,
            owner: userId
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        const completionDate = date ? new Date(date) : new Date();
        const dateStr = completionDate.toISOString().split('T')[0];

        // Check if already completed for this date
        const existingCompletion = habit.completions.find(
            c => c.date.toISOString().split('T')[0] === dateStr
        );

        if (existingCompletion) {
            // Update existing completion
            existingCompletion.value = value;
            existingCompletion.notes = notes;
            existingCompletion.completedAt = new Date();
        } else {
            // Add new completion
            habit.completions.push({
                date: completionDate,
                value,
                notes,
                completedAt: new Date()
            });
        }

        // Update streak
        await updateHabitStreak(habit);

        const saved = await habit.save();
        res.json({ success: true, habit: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Remove habit completion for a date
export const uncompleteHabit = async(req, res) => {
    try {
        const { habitId } = req.params;
        const { date } = req.body;
        const userId = req.user.id;

        const habit = await Habit.findOne({
            _id: habitId,
            owner: userId
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: "Habit not found"
            });
        }

        const completionDate = date ? new Date(date) : new Date();
        const dateStr = completionDate.toISOString().split('T')[0];

        habit.completions = habit.completions.filter(
            c => c.date.toISOString().split('T')[0] !== dateStr
        );

        // Update streak
        await updateHabitStreak(habit);

        const saved = await habit.save();
        res.json({ success: true, habit: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get habit statistics
export const getHabitStats = async(req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter['completions.date'] = {};
            if (startDate) dateFilter['completions.date'].$gte = new Date(startDate);
            if (endDate) dateFilter['completions.date'].$lte = new Date(endDate);
        }

        const habits = await Habit.find({
            owner: userId,
            isActive: true,
            ...dateFilter
        });

        const stats = habits.map(habit => {
            const completions = habit.completions.filter(c => {
                if (!startDate && !endDate) return true;
                const date = c.date;
                if (startDate && date < new Date(startDate)) return false;
                if (endDate && date > new Date(endDate)) return false;
                return true;
            });

            const totalCompletions = completions.reduce((sum, c) => sum + c.value, 0);
            const completionRate = completions.length / getDaysInRange(startDate, endDate) * 100;

            return {
                habitId: habit._id,
                title: habit.title,
                category: habit.category,
                frequency: habit.frequency,
                targetValue: habit.targetValue,
                currentStreak: habit.streak.current,
                longestStreak: habit.streak.longest,
                totalCompletions,
                completionRate: Math.round(completionRate),
                completions: completions.length
            };
        });

        res.json({ success: true, stats });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Helper function to update habit streak
const updateHabitStreak = async(habit) => {
    const completions = habit.completions
        .map(c => ({ date: c.date, value: c.value }))
        .sort((a, b) => b.date - a.date);

    if (completions.length === 0) {
        habit.streak.current = 0;
        habit.streak.lastCompleted = null;
        return;
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completions.length; i++) {
        const completion = completions[i];
        const completionDate = new Date(completion.date);
        completionDate.setHours(0, 0, 0, 0);

        if (completion.value >= habit.targetValue) {
            if (lastDate === null) {
                lastDate = completionDate;
                tempStreak = 1;
            } else {
                const daysDiff = Math.floor((lastDate - completionDate) / (1000 * 60 * 60 * 24));
                if (daysDiff === 1) {
                    tempStreak++;
                    lastDate = completionDate;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                    lastDate = completionDate;
                }
            }
        }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Check if current streak is still active
    if (lastDate && Math.floor((today - lastDate) / (1000 * 60 * 60 * 24)) <= 1) {
        currentStreak = tempStreak;
    }

    habit.streak.current = currentStreak;
    habit.streak.longest = longestStreak;
    habit.streak.lastCompleted = lastDate;
};

// Helper function to get days in range
const getDaysInRange = (startDate, endDate) => {
    if (!startDate && !endDate) return 30; // Default to 30 days
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};



















