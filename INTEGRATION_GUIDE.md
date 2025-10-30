# Frontend-Backend Integration Guide

This guide explains how to connect the TickUp frontend with the Tickappback backend.

## Quick Start

### 1. Backend Setup
```bash
# Clone the backend
git clone https://github.com/nikpz/Tickappback.git
cd Tickappback

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Start the backend
npm run dev
```

Backend will run on: `http://localhost:3000`

### 2. Frontend Setup
```bash
# In the frontend directory
# Configure environment
# Update .env.local with:
REACT_APP_SOCKET_URL=http://localhost:3000
GEMINI_API_KEY=your_api_key_here

# Install dependencies
npm install

# Start the frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 3. Test Connection
```bash
# From the frontend directory
npm run test:backend
```

## Event Mapping

### Authentication Events

**Frontend currently uses:**
- `login:attempt` → Backend expects: `login`
- `login:success` → Backend emits: `login:success` ✅
- `login:fail` → Backend returns error via callback

**Update Required:**
The frontend needs to change from `login:attempt` to `login` to match backend.

### Calendar Events

**Frontend uses:**
- `calendarEvents:*`

**Backend uses:**
- `calendar:*`

Both work but naming is inconsistent.

## Configuration Checklist

Before connecting:

- [ ] Backend running on port 3000
- [ ] PostgreSQL database configured
- [ ] `REACT_APP_SOCKET_URL=http://localhost:3000` in frontend `.env.local`
- [ ] Backend CORS allows frontend origin
- [ ] JWT token passed on socket connection (for authenticated requests)

## Known Compatibility Issues

### 1. Login Event Name
**Issue:** Frontend emits `login:attempt`, backend expects `login`

**Fix Applied:** Updated frontend to use `login` event

### 2. Token Authentication
**Issue:** Backend requires JWT token for most operations

**Solution:** Store token from login response and pass on socket connection:
```typescript
socket.auth = { token: storedToken };
socket.connect();
```

## Testing Real-Time Sync

1. Open two browser windows
2. Login to both
3. Create a task in one window
4. Verify it appears in the other window immediately

If it doesn't work:
- Check browser console for socket errors
- Verify backend logs show the broadcast event
- Ensure both windows are authenticated

## Troubleshooting

### Connection Refused
- Verify backend is running: `curl http://localhost:3000`
- Check `REACT_APP_SOCKET_URL` in `.env.local`

### Authentication Errors
- Verify JWT token is being sent
- Check backend logs for auth middleware errors
- Ensure token hasn't expired (30-day expiry)

### Events Not Received
- Check if component uses MobX observer
- Verify SocketManager has listener for the event
- Check backend is emitting broadcast events

## Backend API Documentation

See [BACKEND_ANALYSIS.md](BACKEND_ANALYSIS.md) for:
- Complete event list
- Event naming conventions
- Database schema
- Authentication details
