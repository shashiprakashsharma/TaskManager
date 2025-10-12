import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
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
        enum: ['Health', 'Productivity', 'Learning', 'Social', 'Personal', 'Other'],
        default: 'Personal'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },
    targetValue: {
        type: Number,
        default: 1
    },
    unit: {
        type: String,
        default: 'times'
    },
    color: {
        type: String,
        default: '#8B5CF6' // purple
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
    isActive: {
        type: Boolean,
        default: true
    },
    streak: {
        current: {
            type: Number,
            default: 0
        },
        longest: {
            type: Number,
            default: 0
        },
        lastCompleted: {
            type: Date
        }
    },
    completions: [{
        date: {
            type: Date,
            required: true
        },
        value: {
            type: Number,
            default: 1
        },
        notes: {
            type: String,
            trim: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    reminders: [{
        time: {
            type: String, // HH:MM format
            required: true
        },
        days: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    }],
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
habitSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Index for better query performance
habitSchema.index({ owner: 1, createdAt: -1 });
habitSchema.index({ owner: 1, isActive: 1 });
habitSchema.index({ 'completions.date': 1 });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;



















