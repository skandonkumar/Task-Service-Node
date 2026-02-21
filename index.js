import express from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});
redisClient.on('error', (err) => console.error("Redis Error", err));
redisClient.connect().catch(err => console.error("Redis Connection Error", err));

const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const mongoUrl = `mongodb://${MONGO_HOST}:${MONGO_PORT}/task_db`;
await mongoose.connect(mongoUrl);

const TaskSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    title: String,
    description: String,
    status: { type: String, default: 'PENDING' }
}, {
    versionKey: false
})

const Task = mongoose.model('Task', TaskSchema);

const API_BASE = '/api/node/v1/tasks';

app.post(API_BASE, async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();

        res.status(201).json({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

app.get(`${API_BASE}/:id`, async (req, res) => {
    const { id } = req.params;

    try {
        const cachedTask = await redisClient.get(`tasks::${id}`);
        if (cachedTask) {
            return res.json(JSON.parse(cachedTask));
        }

        //Cache Miss
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const taskData = { id: task._id, title: task.title, description: task.description, status: task.status };
        await redisClient.set(`tasks::${id}`, JSON.stringify(taskData));

        res.json(taskData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log("Node backend running on PORT : ", PORT));


