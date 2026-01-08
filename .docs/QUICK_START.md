# Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Step 1: MongoDB Setup (2 minutes)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (M0)
3. Create database user with password
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string

### Step 2: Configure Environment Variables (1 minute)

**Backend** (`backend/.env`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervue-poll?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
```

**Frontend** - Already configured! (`frontend/.env`)

### Step 3: Start the Application (2 minutes)

#### Option A: Run both servers concurrently (Recommended)

```powershell
npm run dev
```

#### Option B: Run separately in two terminals

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 4: Access the Application

- **Teacher Dashboard**: http://localhost:5173/teacher
- **Student View**: http://localhost:5173/student

## ✅ Verify Installation

1. Backend should show:

   ```
   ✅ MongoDB connected successfully
   ✅ Database indexes created successfully
   🚀 Server running on port 5000
   📡 Socket.io ready for connections
   ```

2. Frontend should show:
   ```
   VITE v5.0.11  ready in X ms
   ➜ Local: http://localhost:5173/
   ```

## 🎯 Quick Test Flow

### Teacher Workflow:

1. Go to http://localhost:5173/teacher
2. Create a poll:
   - Question: "What is your favorite programming language?"
   - Options: JavaScript, Python, TypeScript, Go
   - Duration: 60 seconds
3. Click "Create Poll"
4. Watch the timer count down
5. See real-time votes coming in with student names

### Student Workflow:

1. Open http://localhost:5173/student in a new tab/window
2. Enter your name (e.g., "Alice")
3. Click "Join"
4. See the active poll
5. Click one of the options to vote
6. See aggregate results update in real-time

### Test Multiple Students:

1. Open http://localhost:5173/student in **3-5 different browser tabs**
2. Use different names for each tab
3. Vote with different options
4. Watch the teacher dashboard update in real-time

## 🔧 Common Issues

### Issue: "MONGODB_URI is not defined"

**Solution**: Update `backend/.env` with your MongoDB connection string

### Issue: Frontend can't connect to backend

**Solution**:

1. Ensure backend is running on port 5000
2. Check `frontend/.env` has correct `VITE_API_URL=http://localhost:5000`

### Issue: Socket.io not connecting

**Solution**: Restart both frontend and backend servers

### Issue: "An active poll already exists"

**Solution**:

- End the current poll from teacher dashboard first
- Or wait for the poll to expire
- Or manually clear the database

## 📊 MongoDB Indexes (Auto-created)

The application automatically creates these indexes on startup:

1. **Single Active Poll**: `{ status: 1 }` with partial filter
2. **Vote Protection**: `{ pollId: 1, studentSessionId: 1 }` unique
3. **Session TTL**: `{ lastHeartbeat: 1 }` expires after 24h

## 🎨 Features to Test

- ✅ Create poll with multiple options
- ✅ Timer counts down in real-time
- ✅ Vote from multiple student tabs
- ✅ Teacher sees detailed votes with names
- ✅ Students see only aggregate results
- ✅ Poll auto-expires at 0 seconds
- ✅ Manual poll end from teacher
- ✅ Try voting twice (should fail)
- ✅ Refresh page (state recovers)
- ✅ Open student in multiple tabs (different sessions)

## 🚀 Next Steps

1. **Deploy Backend**: Use Render.com or Railway.app
2. **Deploy Frontend**: Use Vercel or Netlify
3. **Update Environment Variables**: Point frontend to production backend URL
4. **Test Production**: Ensure CORS and Socket.io work across domains

## 📝 Development Notes

- Backend uses TypeScript with hot reload (`tsx watch`)
- Frontend uses Vite with HMR
- All changes auto-reload without manual restart
- Check console logs for errors
- MongoDB indexes are created automatically
- Session storage is per-tab (open multiple tabs to test)

## 🎯 Assignment Completion Checklist

- ✅ Single active poll enforcement
- ✅ Real-time voting with Socket.io
- ✅ Named votes (teacher) vs aggregate (student)
- ✅ Auto-expiring timer
- ✅ Race condition protection
- ✅ Per-tab session storage
- ✅ MongoDB with proper indexes
- ✅ Teacher dashboard with analytics
- ✅ Student onboarding flow
- ✅ Responsive design with Tailwind
- ✅ TypeScript throughout
- ✅ Error handling
- ✅ Git version control

---

**Time to MVP**: 12 hours (Phase 1 complete)  
**Status**: ✅ All 54 tasks completed  
**Ready for**: Testing and deployment
