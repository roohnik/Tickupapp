<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TickUp - Real-time Collaboration Platform

A comprehensive task management and collaboration platform with real-time synchronization, OKR tracking, document management, and more.

View your app in AI Studio: https://ai.studio/apps/drive/1KXCBnwR08st52wkcHoXFg4uOGMq7IpoL

## Features

- 🎯 **OKR Management** - Objectives and Key Results tracking
- 📋 **Task Management** - Kanban boards, task tracking, and project management
- 📄 **Document Management** - Collaborative document editing and sharing
- 📝 **Forms & Surveys** - Custom form builder with submissions
- 📊 **Strategic Planning** - SWOT analysis, strategy management
- 🎓 **Learning Management** - Resource assignments and tracking
- 💬 **Feedback System** - Feedback collection and management
- 👥 **Team Collaboration** - Real-time updates across all users
- 📈 **Reports & Analytics** - Comprehensive reporting and insights
- 🔄 **Real-time Sync** - Socket.io powered live updates

## Prerequisites

- Node.js (v16 or higher)
- A running backend server with Socket.io

> **✅ BACKEND SYNCHRONIZED:** This frontend is now synced with https://github.com/nikpz/Tickappback.git  
> See **[SYNC_COMPLETE.md](SYNC_COMPLETE.md)** for complete integration summary.
>
> **Setup Guide:** See **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** for:
> - Backend setup instructions
> - Connection testing
> - Troubleshooting

## Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create or update `.env.local`:
   ```bash
   # Backend Socket.io URL (required)
   REACT_APP_SOCKET_URL=http://localhost:3000
   
   # Gemini API Key for AI features (optional)
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

## Backend Synchronization

This frontend requires a Socket.io backend server to function. The backend must implement the Socket.io API specification defined in this repository.

### Quick Start with Backend

If you have a backend repository:

1. Ensure your backend implements the Socket.io events listed in [BACKEND_API_SPEC.json](BACKEND_API_SPEC.json)
2. Start your backend server (typically on `http://localhost:3000`)
3. Update `REACT_APP_SOCKET_URL` in `.env.local` to point to your backend
4. Start this frontend application

### Documentation

- **[BACKEND_SYNC_GUIDE.md](BACKEND_SYNC_GUIDE.md)** - Comprehensive guide on backend synchronization
- **[BACKEND_API_SPEC.json](BACKEND_API_SPEC.json)** - Complete Socket.io API specification
- **[SYNC_ISSUES.md](SYNC_ISSUES.md)** - Known synchronization issues and solutions
- **[CURRENT_STATUS.md](CURRENT_STATUS.md)** - Current project status and migration progress

### Required Backend Events

The backend must handle 143+ socket events across these categories:
- Authentication (login, register, logout)
- Workspaces, Teams, Users
- Tasks, Projects, Documents
- Objectives, Key Results (OKRs)
- Forms, Feedback, Strategies
- Learning resources, Processes
- Calendar, Notifications
- Audit logs, Settings

See [BACKEND_SYNC_GUIDE.md](BACKEND_SYNC_GUIDE.md) for complete details.

## Project Structure

```
├── components/         # Reusable UI components
├── modals/            # Modal dialogs
├── stores/            # MobX state management stores
│   └── SocketManager.ts  # Socket.io event handling
├── services/          # External services (Socket.io, Gemini AI)
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types.ts           # TypeScript type definitions
├── emitter.ts         # Socket.io event emitters (707 functions)
└── constants.ts       # Application constants
```

## Architecture

- **State Management:** MobX (migration in progress - currently 10% complete)
- **Real-time Communication:** Socket.io
- **UI Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (via utility classes)

### Current Migration Status

The application is currently migrating from prop-based architecture to MobX:
- ✅ 10% of components use MobX stores (full reactivity)
- ⚠️ 72% of components use props (limited reactivity)
- 🎯 Goal: 100% MobX integration for complete real-time synchronization

See [REFACTORING_PLAN.md](REFACTORING_PLAN.md) for migration details.

## Development

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Need Help with Backend?

If you:
- Don't have a backend yet
- Need to update your backend to match this frontend
- Want to ensure proper synchronization

Please refer to:
1. [BACKEND_SYNC_GUIDE.md](BACKEND_SYNC_GUIDE.md) - Implementation guide with examples
2. [BACKEND_API_SPEC.json](BACKEND_API_SPEC.json) - Complete API specification
3. Open an issue in this repository with your backend GitHub link

## Contributing

This project is in active development. The main focus is completing the MobX migration to ensure full real-time synchronization across all components.

## License

[Add your license here]
