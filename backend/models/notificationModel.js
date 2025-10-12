import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['task_reminder', 'task_due', 'task_overdue', 'goal_milestone', 'habit_reminder', 'system', 'team_invite'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        goalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Goal'
        },
        habitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Habit'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    channels: [{
        type: String,
        enum: ['email', 'push', 'sms', 'in_app'],
        default: 'in_app'
    }],
    scheduledFor: {
        type: Date,
        required: true
    },
    sent: {
        type: Boolean,
        default: false
    },
    sentAt: {
        type: Date
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    clicked: {
        type: Boolean,
        default: false
    },
    clickedAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update updatedAt field
notificationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Index for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, sent: 1 });
notificationSchema.index({ scheduledFor: 1, sent: 1 });
notificationSchema.index({ type: 1, isActive: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;



















