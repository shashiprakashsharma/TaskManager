import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true 
    },
    description:{
        type: String,
        default: ''
    },
    priority:{
        type: String,
        enum:['Low','Medium','High'], default: 'Low'
    },
    category: {
        type: String,
        enum: ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Travel', 'Other'],
        default: 'Other'
    },
    tags: [{
        type: String,
        trim: true
    }],
    dueDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 0
    },
    actualTime: {
        type: Number, // in minutes
        default: 0
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'daily'
    },
    recurringInterval: {
        type: Number,
        default: 1
    },
    nextRecurringDate: {
        type: Date
    },
    parentTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    subtasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    reminders: [{
        type: {
            type: String,
            enum: ['email', 'push', 'sms'],
            default: 'push'
        },
        time: Date,
        sent: {
            type: Boolean,
            default: false
        }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    completed:{
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    archived: {
        type: Boolean,
        default: false
    },
    archivedAt: {
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
taskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Index for better query performance
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, category: 1 });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ owner: 1, tags: 1 });

const Task = mongoose.model.Task || mongoose.model('Task',taskSchema);
export default Task;