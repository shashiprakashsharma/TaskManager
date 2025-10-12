import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['Career', 'Health', 'Finance', 'Learning', 'Personal', 'Travel', 'Other'],
        default: 'Personal'
    },
    type: {
        type: String,
        enum: ['target', 'habit', 'project', 'milestone'],
        default: 'target'
    },
    targetValue: {
        type: Number
    },
    currentValue: {
        type: Number,
        default: 0
    },
    unit: {
        type: String,
        default: 'points'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    targetDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'cancelled'],
        default: 'active'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    color: {
        type: String,
        default: '#10B981' // green
    },
    icon: {
        type: String,
        default: '🎯'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    milestones: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        targetValue: {
            type: Number
        },
        currentValue: {
            type: Number,
            default: 0
        },
        targetDate: {
            type: Date
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    habits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit'
    }],
    progress: [{
        date: {
            type: Date,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        notes: {
            type: String,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    completedAt: {
        type: Date
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
goalSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
    if (!this.targetValue || this.targetValue === 0) return 0;
    return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
});

// Index for better query performance
goalSchema.index({ owner: 1, createdAt: -1 });
goalSchema.index({ owner: 1, status: 1 });
goalSchema.index({ owner: 1, targetDate: 1 });
goalSchema.index({ 'progress.date': 1 });

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;



















