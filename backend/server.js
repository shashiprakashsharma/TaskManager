import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import {connectDB} from './config/db.js'

import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js'
import noteRouter from './routes/noteRoute.js'
import timeTrackingRouter from './routes/timeTrackingRoute.js'
import habitRouter from './routes/habitRoute.js'
import goalRouter from './routes/goalRoute.js'
import memoryStorage from './utils/memoryStorage.js'

const app = express();
const port = process.env.PORT || 4000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// DB CONNECT
connectDB();

// routes

app.use("/api/user",userRouter);
app.use("/api/task", taskRouter);
app.use("/api/notes", noteRouter);
app.use("/api/time-tracking", timeTrackingRouter);
app.use("/api/habits", habitRouter);
app.use("/api/goals", goalRouter);

app.get('/',(req, res) => {
    res.send('API WORKING');
})

// Test endpoint for time tracking
app.get('/test-time-tracking', (req, res) => {
    res.json({
        success: true,
        message: 'Time tracking API is working',
        memoryStorage: {
            timeTrackings: memoryStorage.data.timeTrackings.length,
            tasks: memoryStorage.data.tasks.length
        }
    });
})

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
    
})