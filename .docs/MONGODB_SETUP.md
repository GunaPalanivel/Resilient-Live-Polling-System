# MongoDB Atlas Setup Guide

## ⚡ Quick Setup (2 minutes)

### Step 1: Create Free Cluster

1. Go to https://cloud.mongodb.com/
2. Sign up or log in
3. Click "Build a Database"
4. Select **M0 Free** tier
5. Choose a cloud provider (AWS recommended)
6. Select closest region to you
7. Cluster name: `intervue-poll-cluster`
8. Click "Create"

### Step 2: Create Database User

1. In "Security" → "Database Access"
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `intervue-admin`
5. Password: Generate secure password (click "Autogenerate")
6. **SAVE THIS PASSWORD!** You'll need it later
7. Database User Privileges: **Read and write to any database**
8. Click "Add User"

### Step 3: Whitelist IP Address

1. In "Security" → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - This adds `0.0.0.0/0`
   - ⚠️ For production, add specific IPs only
4. Click "Confirm"

### Step 4: Get Connection String

1. Go to "Database" → "Clusters"
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy the connection string:
   ```
   mongodb+srv://intervue-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Update Backend .env

1. Open `backend/.env`
2. Replace `<password>` with your saved password
3. Add database name: `intervue-poll`

**Final connection string**:

```env
MONGODB_URI=mongodb+srv://intervue-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/intervue-poll?retryWrites=true&w=majority
```

Example:

```env
MONGODB_URI=mongodb+srv://intervue-admin:Abc123xyz@cluster0.abc12.mongodb.net/intervue-poll?retryWrites=true&w=majority
```

---

## ✅ Verify Connection

Run the backend:

```powershell
cd backend
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
✅ Database indexes created successfully
🚀 Server running on port 5000
```

If you see these messages, MongoDB is configured correctly!

---

## 🔍 View Data in MongoDB Atlas

1. Go to your cluster
2. Click "Browse Collections"
3. You'll see 3 collections after first use:
   - `polls` - All polls created
   - `votes` - All votes submitted
   - `studentsessions` - Active student sessions

---

## 📊 Check Indexes

In MongoDB Atlas:

1. Go to "Collections"
2. Select `polls` collection
3. Click "Indexes" tab
4. You should see:
   - `_id_` (default)
   - `status_1` (unique, partial filter)
   - `createdAt_-1`

Repeat for `votes` and `studentsessions` collections.

---

## 🐛 Troubleshooting

### Error: "Authentication failed"

- Check username and password in connection string
- Ensure password doesn't contain special characters (URL encode if needed)

### Error: "Connection timeout"

- Check IP whitelist (0.0.0.0/0 should be added)
- Check firewall settings

### Error: "MongoServerError: E11000 duplicate key error"

- Good! This means indexes are working
- This prevents duplicate active polls / votes

---

## 🔐 Security Best Practices

### For Development (Current):

- ✅ IP whitelist: 0.0.0.0/0 (allow anywhere)
- ✅ Auto-generated strong password
- ✅ Read/write access only

### For Production (Later):

- 🔒 Restrict IP whitelist to your server IP
- 🔒 Use environment variables (never commit .env)
- 🔒 Enable MongoDB auditing
- 🔒 Set up backup schedules

---

## 📝 Connection String Breakdown

```
mongodb+srv://                    # Protocol (SRV record)
intervue-admin:PASSWORD           # Username and password
@cluster0.xxxxx.mongodb.net       # Cluster hostname
/intervue-poll                    # Database name (auto-created)
?retryWrites=true&w=majority      # Connection options
```

---

## 🎯 Quick Test

1. Start backend: `npm run dev` in `/backend`
2. Check logs for "MongoDB connected successfully"
3. Open http://localhost:5000/api/health
4. Should return: `{"success": true, "message": "Server is running"}`

---

## 📚 Useful MongoDB Atlas Features

### Monitoring:

- **Metrics**: CPU, memory, connections
- **Real-time**: View queries as they happen
- **Alerts**: Set up email notifications

### Performance:

- **Performance Advisor**: Suggests index improvements
- **Query Profiler**: Analyze slow queries
- **Schema Analyzer**: Validate data structure

### Backup:

- **Cloud Backup**: Auto-enabled on M2+ (not M0)
- **Manual Export**: Use `mongodump` for M0

---

## 🚀 Next Steps

After MongoDB is connected:

1. ✅ Start backend: `npm run dev` in `/backend`
2. ✅ Start frontend: `npm run dev` in `/frontend`
3. ✅ Test at http://localhost:5173/teacher
4. ✅ Create your first poll!

---

**Estimated Setup Time**: 2-3 minutes  
**Cluster Type**: M0 (Free forever)  
**Storage**: 512 MB  
**Connections**: Shared  
**Cost**: $0.00/month
