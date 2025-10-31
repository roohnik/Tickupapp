# Backend Synchronization Guide

This guide explains how the TickUp frontend synchronizes with the backend and what the backend needs to implement.

## Overview

The frontend uses **Socket.io** for real-time bidirectional communication with the backend. All data synchronization happens through socket events.

## Backend Requirements

### 1. Socket.io Server Setup

The backend must run a Socket.io server on the URL specified in the environment variable:

```bash
# Default: http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000
```

### 2. Required Socket Event Handlers

The frontend expects the backend to handle **707+ socket events** across these categories:

#### Authentication & Users
- `auth:login` - User login
- `auth:register` - User registration
- `auth:logout` - User logout
- `users:list` - Get all users
- `users:get` - Get single user
- `users:update` - Update user
- `users:delete` - Delete user

#### Workspaces
- `workspaces:list` - Get all workspaces
- `workspaces:get` - Get single workspace
- `workspaces:create` - Create workspace
- `workspaces:update` - Update workspace
- `workspaces:delete` - Delete workspace
- `workspaces:restore` - Restore deleted workspace

#### Teams
- `teams:list` - Get all teams
- `teams:create` - Create team
- `teams:update` - Update team
- `teams:delete` - Delete team
- `teams:set` - Bulk set teams

#### Tasks
- `tasks:list` - Get all tasks
- `tasks:create` - Create task
- `tasks:update` - Update task
- `tasks:delete` - Delete task
- `tasks:move` - Move task
- `tasks:reorder` - Reorder tasks

#### Projects
- `projects:list` - Get all projects
- `projects:create` - Create project
- `projects:update` - Update project
- `projects:delete` - Delete project

#### Documents
- `documents:list` - Get all documents
- `documents:create` - Create document
- `documents:update` - Update document
- `documents:delete` - Delete document
- `documentStatuses:list` - Get document statuses

#### Forms
- `forms:list` - Get all forms
- `forms:create` - Create form
- `forms:update` - Update form
- `forms:delete` - Delete form
- `forms:pin` - Pin form
- `forms:move` - Move form
- `forms:approve` - Approve form submission
- `formSubmissions:list` - Get form submissions
- `formSubmissions:create` - Submit form

#### Objectives & Key Results (OKRs)
- `objectives:list` - Get all objectives
- `objectives:create` - Create objective
- `objectives:update` - Update objective
- `objectives:delete` - Delete objective
- `keyResults:list` - Get key results
- `keyResults:create` - Create key result
- `keyResults:update` - Update key result
- `keyResults:delete` - Delete key result
- `krCheckins:create` - Create check-in
- `krCategories:list` - Get KR categories

#### Feedback
- `feedback:list` - Get all feedback
- `feedback:create` - Create feedback
- `feedback:update` - Update feedback
- `feedback:delete` - Delete feedback
- `generalFeedbacks:list` - Get general feedbacks
- `generalFeedbacks:create` - Create general feedback
- `feedbackTags:list` - Get feedback tags
- `feedbackTags:create` - Create tag
- `feedbackTags:update` - Update tag
- `feedbackTags:deleted` - Delete tag

#### Strategies
- `strategies:list` - Get all strategies
- `strategies:create` - Create strategy
- `strategies:update` - Update strategy
- `strategies:delete` - Delete strategy
- `strategies:destroyed` - Permanently delete
- `strategies:restored` - Restore strategy
- `strategies:status-changed` - Change status

#### Learning & Resources
- `learningResources:list` - Get resources
- `learningResources:create` - Create resource
- `learningResources:update` - Update resource
- `learningResources:delete` - Delete resource
- `learningAssignments:list` - Get assignments
- `learningAssignments:create` - Create assignment

#### Processes
- `processes:list` - Get all processes
- `processes:create` - Create process
- `processes:update` - Update process
- `processes:delete` - Delete process

#### Calendar
- `calendarEvents:list` - Get calendar events
- `calendarEvents:create` - Create event
- `calendarEvents:update` - Update event
- `calendarEvents:delete` - Delete event

#### Notifications
- `notifications:list` - Get notifications
- `notifications:create` - Create notification
- `notifications:markAsRead` - Mark as read
- `notifications:markAllAsRead` - Mark all read
- `notifications:delete` - Delete notification

#### Audit Logs
- `audit:log` - Log audit event
- `audit:list` - Get audit logs

#### Settings & Permissions
- `settings:get` - Get settings
- `settings:update` - Update settings
- `permissions:list` - Get permissions
- `roles:list` - Get roles
- `roles:create` - Create role
- `roles:update` - Update role
- `roles:delete` - Delete role

#### Customers & CRM
- `customers:list` - Get customers
- `customers:create` - Create customer
- `customers:update` - Update customer
- `customers:delete` - Delete customer

### 3. Broadcast Events

When data changes on the backend, it must broadcast events to all connected clients:

```javascript
// Example: When a task is created
socket.broadcast.emit('tasks:created', newTask);

// Example: When a document is updated
io.emit('documents:updated', updatedDocument);

// Example: When an objective is deleted
io.emit('objectives:deleted', objectiveId);
```

### 4. Response Format

All socket event handlers should respond with this format:

```javascript
// Success
callback({
  ok: true,
  data: result,
  message: "Operation successful"
});

// Error
callback({
  ok: false,
  error: "Error message"
});
```

### 5. Authentication

Socket connections must be authenticated:

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify token
  if (isValid(token)) {
    socket.userId = getUserIdFromToken(token);
    next();
  } else {
    next(new Error("Authentication failed"));
  }
});
```

## Frontend Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# Backend Socket.io URL
REACT_APP_SOCKET_URL=http://localhost:3000

# Gemini API Key (for AI features)
GEMINI_API_KEY=your_api_key_here
```

### Socket Connection

The frontend connects automatically on startup:

```typescript
// services/socketService.ts
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
  withCredentials: true
});
```

## Testing Synchronization

### Two-Window Sync Test

1. Open the app in two browser windows (User A & User B)
2. User A creates/updates/deletes any entity
3. User B should see the change immediately without refresh

### Current Status

- ✅ **Infrastructure**: 143 socket listeners, 707 emitters configured
- ⚠️ **Components**: Only 10% properly integrated with MobX stores
- ❌ **Reactivity**: 72% of components use props and won't see real-time updates

### What Needs to Be Fixed

Most components are not using MobX stores directly, which breaks real-time synchronization. See [SYNC_ISSUES.md](SYNC_ISSUES.md) and [REFACTORING_PLAN.md](REFACTORING_PLAN.md) for details.

## Backend Implementation Example

Here's a minimal backend implementation example:

```javascript
// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    credentials: true
  }
});

// In-memory storage (use database in production)
const tasks = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // List tasks
  socket.on('tasks:list', (payload, callback) => {
    callback({ ok: true, tasks });
  });

  // Create task
  socket.on('tasks:create', (task, callback) => {
    const newTask = { ...task, id: Date.now().toString() };
    tasks.push(newTask);
    
    // Broadcast to all clients
    io.emit('tasks:created', newTask);
    
    callback({ ok: true, task: newTask });
  });

  // Update task
  socket.on('tasks:update', (task, callback) => {
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...task };
      io.emit('tasks:updated', tasks[index]);
      callback({ ok: true, task: tasks[index] });
    } else {
      callback({ ok: false, error: 'Task not found' });
    }
  });

  // Delete task
  socket.on('tasks:delete', ({ id }, callback) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      io.emit('tasks:deleted', id);
      callback({ ok: true });
    } else {
      callback({ ok: false, error: 'Task not found' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
```

## Complete Backend API Reference

For a complete list of all socket events and their expected payloads, see:
- [emitter.ts](emitter.ts) - All frontend emitter functions (707 functions)
- [stores/SocketManager.ts](stores/SocketManager.ts) - All socket event listeners (143 events)

## Troubleshooting

### Connection Issues

If the frontend can't connect to the backend:

1. Check `REACT_APP_SOCKET_URL` in `.env.local`
2. Ensure backend Socket.io server is running
3. Check CORS configuration on backend
4. Open browser console and look for Socket.io errors

### Real-time Updates Not Working

If changes don't appear in real-time:

1. Check if the component uses `observer` from `mobx-react-lite`
2. Check if the component uses `useStore()` hook
3. Verify the backend emits broadcast events (e.g., `io.emit('tasks:created', task)`)
4. See [SYNC_ISSUES.md](SYNC_ISSUES.md) for component-specific issues

## Next Steps

1. **If you have a backend repository**: Share the GitHub link and we'll ensure the APIs match
2. **If you need to create a backend**: Use the example above and implement the required event handlers
3. **To fix frontend synchronization**: Continue the MobX migration following [REFACTORING_PLAN.md](REFACTORING_PLAN.md)

## Questions?

If you have a specific backend repository you want to sync with, please provide the GitHub link and we can:
- Analyze the backend API structure
- Update socket events to match
- Ensure proper synchronization between frontend and backend
