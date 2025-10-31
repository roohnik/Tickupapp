# Quick Start: Backend Integration

## 🚀 For Users Who Have a Backend

If you have a backend repository and want to sync it with this frontend:

### Step 1: Share Your Backend
Please provide:
- GitHub repository URL of your backend
- Branch name (if not main/master)
- Any specific documentation about your API

### Step 2: We'll Analyze
We will:
- Review your backend API structure
- Compare with our socket event requirements
- Identify any mismatches or missing endpoints
- Create a sync plan

### Step 3: Update & Test
- Update frontend socket events to match your backend
- Update backend to implement any missing events (if needed)
- Run `npm run test:backend` to verify connectivity
- Test real-time synchronization

---

## 🛠️ For Users Creating a Backend

If you need to create a backend for this frontend:

### Minimum Viable Backend

Create a Node.js + Socket.io server with these essentials:

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Essential endpoints to get started:
  
  // 1. Authentication
  socket.on('auth:login', ({ email, password }, callback) => {
    // Validate credentials
    callback({ 
      ok: true, 
      user: { id: '1', name: 'User', email },
      token: 'jwt-token'
    });
  });

  // 2. Tasks
  socket.on('tasks:list', (payload, callback) => {
    callback({ ok: true, tasks: [] });
  });
  
  socket.on('tasks:create', (task, callback) => {
    const newTask = { ...task, id: Date.now() };
    io.emit('tasks:created', newTask); // Broadcast
    callback({ ok: true, task: newTask });
  });

  // 3. Workspaces
  socket.on('workspaces:list', (payload, callback) => {
    callback({ ok: true, workspaces: [] });
  });

  // 4. Teams
  socket.on('teams:list', (payload, callback) => {
    callback({ ok: true, teams: [] });
  });

  // 5. Users
  socket.on('users:list', (payload, callback) => {
    callback({ ok: true, users: [] });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
```

### Install Dependencies
```bash
npm init -y
npm install express socket.io
node server.js
```

### Test Connection
In the frontend directory:
```bash
npm run test:backend
```

### Expand Gradually
Once basic connectivity works, implement additional events from [BACKEND_API_SPEC.json](BACKEND_API_SPEC.json):
1. Start with entities you need (tasks, projects, documents)
2. Add create/read/update/delete for each
3. Implement broadcast events for real-time sync
4. Add remaining categories as needed

---

## 📋 Connection Checklist

Before the frontend can work properly:

- [ ] Backend Socket.io server running
- [ ] CORS configured to allow frontend origin
- [ ] `REACT_APP_SOCKET_URL` in `.env.local` points to backend
- [ ] Authentication endpoints implemented
- [ ] At minimum: users, workspaces, teams, tasks endpoints
- [ ] Connection test passes: `npm run test:backend`
- [ ] Real-time broadcast events working

---

## 🔍 Testing Real-Time Sync

Once connected, test synchronization:

1. **Open two browser windows** with the app
2. **In Window 1**: Create a task/objective/document
3. **In Window 2**: Should see the new item appear immediately (no refresh)

If Window 2 doesn't update:
- Check browser console for socket errors
- Verify backend emits broadcast events (`io.emit()`)
- Note: Some frontend components may not update due to incomplete MobX migration (see [SYNC_ISSUES.md](SYNC_ISSUES.md) for frontend-specific issues)

---

## 📚 Full Documentation

- **[BACKEND_SYNC_GUIDE.md](BACKEND_SYNC_GUIDE.md)** - Complete implementation guide
- **[BACKEND_API_SPEC.json](BACKEND_API_SPEC.json)** - All 143 socket events
- **[SYNC_ISSUES.md](SYNC_ISSUES.md)** - Known frontend sync issues
- **[REFACTORING_PLAN.md](REFACTORING_PLAN.md)** - MobX migration plan

---

## 💬 Need Help?

**Have a backend?** Drop the GitHub link as a comment and we'll help sync it.

**Building from scratch?** Follow the minimal backend above and expand using our API spec.

**Issues connecting?** Run `npm run test:backend` and share the output.
