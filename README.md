# Task Service - Node.js (Express)

Flexible task management API built with Express.js and MongoDB.

## Overview

This service implements the task management API using:
- **Framework**: Express.js
- **Database**: MongoDB (Document-oriented NoSQL)
- **Cache**: Redis
- **Purpose**: Rapid iteration, flexible schema, document storage

## Architecture

```
Express Router → Mongoose Models → MongoDB
      ↓
    Redis (Cache Layer)
```

## Prerequisites

- Node.js 18+
- npm or Yarn
- MongoDB 5.0+
- Redis 7.0+
- Docker (for containerized deployment)

## Local Development

### 1. Start Dependencies

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Start Redis
docker run -d --name redis -p 6379:6379 redis:alpine
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm start
```

The service will start on `http://localhost:3000`

## Configuration

Set environment variables:

```bash
# Express
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_HOST=localhost
MONGO_PORT=27017

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

Or create a `.env` file:

```env
PORT=3000
MONGO_HOST=localhost
MONGO_PORT=27017
REDIS_HOST=localhost
REDIS_PORT=6379
```

## API Endpoints

### Create Task

```bash
POST /api/node/v1/tasks
Content-Type: application/json

{
  "title": "My Task",
  "description": "Task description",
  "priority": "HIGH"
}
```

### Get Task

```bash
GET /api/node/v1/tasks/{id}
```

### Update Task

```bash
PUT /api/node/v1/tasks/{id}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Delete Task

```bash
DELETE /api/node/v1/tasks/{id}
```

### List Tasks

```bash
GET /api/node/v1/tasks?skip=0&limit=10
```

## Docker Deployment

### Build Image

```bash
docker build -t task-service-node:1.0.0 .
```

### Run Container

```bash
docker run -d \
  --name node-backend \
  --network task-network \
  -p 3000:3000 \
  -e MONGO_HOST=mongodb \
  -e REDIS_HOST=redis \
  task-service-node:1.0.0
```

## Kubernetes Deployment

```bash
kubectl apply -f /path/to/infrastructure/dev/node-backend.yaml
```

Monitor startup:

```bash
kubectl get pods -n dev -l app=node-backend -w
kubectl logs -n dev -l app=node-backend
```

## Project Structure

```
├── index.js               # Express server and routes
├── package.json          # Dependencies
├── Dockerfile            # Container image
└── .gitignore            # Git ignore rules
```

## Development Scripts

```bash
# Start server
npm start

# Run in development with auto-reload
npm run dev

# Run tests
npm test
```

## Database Schema

### Task Model (MongoDB)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  status: String,
  priority: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Caching Strategy

- Tasks are cached in Redis with key: `tasks::{task_id}`
- Cache TTL: 10 minutes (600s)
- Cache invalidation on update/delete

## Troubleshooting

### MongoDB Connection Refused

Ensure MongoDB is running:

```bash
# Docker
docker logs mongodb

# Kubernetes
kubectl logs -n dev -l app=mongodb
```

### Redis Connection Failed

Check Redis availability:

```bash
# Docker
docker logs redis

# Kubernetes
kubectl logs -n dev -l app=redis
```

### Port Already in Use

Change the PORT environment variable or kill the process:

```bash
# On Linux/Mac
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Performance Notes

- MongoDB's flexible schema allows rapid prototyping
- Document-oriented model suits nested task hierarchies
- Redis cache significantly reduces database load
- Consider indexing on frequently queried fields

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **redis**: Cache client
- **uuid**: Unique ID generation

## License

MIT
