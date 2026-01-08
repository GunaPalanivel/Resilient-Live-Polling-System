# 🚀 5-Minute Quick Start Guide

## Prerequisites

- Node.js 18+ installed ✅
- MongoDB Atlas account (free) ⏳

---

## Step 1: MongoDB Setup (2 minutes)

### Create Free Cluster:

1. Visit https://cloud.mongodb.com/
2. Sign up/login → "Build a Database"
3. Select **M0 FREE** tier
4. Choose AWS, closest region
5. Click "Create"

### Create User:

1. Security → Database Access → "Add New Database User"
2. Username: `intervue-admin`
3. Password: Auto-generate (SAVE IT!)
4. Privileges: Read and write to any database
5. Click "Add User"

### Whitelist IP:

1. Security → Network Access → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### Get Connection String:

1. Database → Clusters → "Connect"
2. "Connect your application"
3. Copy connection string
4. Replace `<password>` with your saved password
5. Add database name: `/intervue-poll`

**Example**:

```
mongodb+srv://intervue-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/intervue-poll?retryWrites=true&w=majority
```

---

## Step 2: Configure Backend (30 seconds)

Open `backend/.env` and update:

```env
MONGODB_URI=mongodb+srv://intervue-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/intervue-poll?retryWrites=true&w=majority
```

---

## Step 3: Start Application (1 minute)

```powershell
# In project root
npm run dev
```

Wait for:

```
✅ MongoDB connected successfully
✅ Database indexes created successfully
🚀 Server running on port 5000
VITE v5.0.11  ready in 423 ms
➜ Local: http://localhost:5173/
```

---

## Step 4: Test! (2 minutes)

### Teacher:

1. Open http://localhost:5173/teacher
2. Create poll:
   - Question: "Favorite language?"
   - Options: JavaScript, Python, Go
   - Duration: 60 seconds
3. Click "Create Poll"

### Students:

1. Open http://localhost:5173/student in **3 tabs**
2. Enter names: Alice, Bob, Charlie
3. Vote with different options
4. Watch real-time updates!

---

## ✅ Success Checklist

- [ ] MongoDB "connected successfully" message
- [ ] Teacher can create poll
- [ ] Timer counts down
- [ ] Students can vote
- [ ] Teacher sees names + votes
- [ ] Students see aggregates only
- [ ] Poll auto-expires at 0:00

---

## 🐛 Troubleshooting

**"MONGODB_URI is not defined"**
→ Check `backend/.env` has connection string

**"Connection timeout"**
→ Verify IP whitelist (0.0.0.0/0) in MongoDB Atlas

**"Authentication failed"**
→ Check password in connection string

**Frontend can't connect**
→ Ensure backend runs on port 5000

---

## 📖 Full Documentation

- [README.md](../README.md) - Complete project overview
- [COMPLETION.md](../COMPLETION.md) - All features + testing

---

**Ready in 5 minutes! 🎉**
