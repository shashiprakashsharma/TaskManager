import mongoose from "mongoose";

const timeTrackingSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: false
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
timeTrackingSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Index for better query performance
timeTrackingSchema.index({ user: 1, task: 1, createdAt: -1 });
timeTrackingSchema.index({ user: 1, isActive: 1 });

const TimeTracking = mongoose.model('TimeTracking', timeTrackingSchema);
export default TimeTracking;



















