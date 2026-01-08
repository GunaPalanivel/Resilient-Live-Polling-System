# Intervue Live Polling System

**Deadline:** January 9, 2026, 11:36 PM IST  
**Status:** 🎨 Design Complete | 📋 Planning Complete | 🔨 Ready to Execute

---

## 📚 Documentation Structure

### Primary Document (Start Here)

- **[MASTER_EXECUTION_PLAN.md](.github/MASTER_EXECUTION_PLAN.md)** - Complete consolidated execution plan with:
  - Full assignment requirements
  - Complete design system (591 lines from Figma)
  - Architecture & tech stack decisions
  - Step-by-step 48-hour timeline
  - 30 AI-assisted development prompts
  - Comprehensive verification checklist
  - **Use this as your primary reference**

### Supporting Documentation

- **[EXECUTION_PLAN.md](.github/EXECUTION_PLAN.md)** - Original architecture deep-dive:
  - System architecture diagrams
  - Data flow scenarios (4 detailed flows)
  - Tech stack rationale table
  - Component inventory
- **[IMPLEMENTATION_NOTES.md](.github/IMPLEMENTATION_NOTES.md)** - Critical code patterns:
  - 8 finalized design decisions
  - MongoDB indexes and schemas
  - Socket.io room logic
  - Timer synchronization code
  - Race condition protection
- **[FIGMA_DESIGN_SPECS.md](.github/FIGMA_DESIGN_SPECS.md)** - Complete design system:
  - Answers to 8 critical design questions
  - Complete color palette (CSS variables)
  - Typography scale
  - Component specifications
  - Animations & transitions
  - Responsive breakpoints

---

## 🎯 Quick Start

**Right now, run these commands:**

```powershell
# Navigate to project
cd "D:\Projects\interview.io"

# Initialize structure
New-Item -ItemType Directory -Path "frontend","backend","docs" -Force

# Setup frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom socket.io-client axios zustand react-hot-toast clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p

# Setup backend (in new terminal)
cd D:\Projects\interview.io\backend
npm init -y
npm install express cors dotenv mongoose socket.io uuid
npm install -D typescript @types/node @types/express @types/cors nodemon ts-node @types/socket.io
npx tsc --init
```

**See [MASTER_EXECUTION_PLAN.md](.github/MASTER_EXECUTION_PLAN.md) for complete step-by-step instructions.**

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Zustand + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Socket.io
- **Database:** MongoDB Atlas (M0 Free)
- **Deployment:** Vercel (frontend) + Render (backend)

---

## ✅ Key Features

### Teacher Persona

- ✅ Create polls with question, options (2-10), and timer (15s-120s)
- ✅ View real-time results with student names
- ✅ End poll manually or auto-expire on timer
- ✅ View poll history
- ✅ Remove students (kick + block)
- ✅ Single active poll enforcement

### Student Persona

- ✅ Enter name (stored in sessionStorage per tab)
- ✅ Join active poll automatically
- ✅ Submit vote (one per poll, cannot change)
- ✅ View aggregate results (anonymous, no names)
- ✅ Timer synchronization (late joiners see correct remaining time)

### State Resilience

- ✅ Page refresh recovers active poll + timer + vote status
- ✅ Timer syncs correctly for late joiners
- ✅ Race condition protection (duplicate vote prevention)
- ✅ sessionStorage isolation (unique per tab)

---

## 📊 Time Allocation

| Phase                   | Duration | Status      |
| ----------------------- | -------- | ----------- |
| **Planning & Design**   | 6 hours  | ✅ Complete |
| **Phase 1: MVP**        | 10 hours | ⏳ Pending  |
| **Phase 2: Production** | 22 hours | ⏳ Pending  |
| **Phase 3: Polish**     | 10 hours | ⏳ Pending  |
| **Total**               | 48 hours | 🎯 On Track |

**Net Time Saved:** 6 hours through strategic decisions (single poll, in-memory chat, teacher-only history)

---

## 🚨 Critical Success Factors

1. **Single Active Poll Enforcement** - MongoDB unique partial index
2. **Timer Synchronization** - Backend-authoritative time calculation
3. **Race Condition Protection** - Database unique compound index
4. **sessionStorage (Not localStorage)** - Per-tab isolation
5. **Pixel-Perfect Design Match** - tokens.css variables
6. **State Recovery** - GET /api/state/current endpoint
7. **Real-Time Updates** - Socket.io room-based broadcasting
8. **Production Deployment** - Live URLs on Vercel + Render

---

## 📖 How to Use This Documentation

1. **Start with:** [MASTER_EXECUTION_PLAN.md](.github/MASTER_EXECUTION_PLAN.md) - Your primary execution guide
2. **Reference:** [IMPLEMENTATION_NOTES.md](.github/IMPLEMENTATION_NOTES.md) - When implementing critical features
3. **Design:** [FIGMA_DESIGN_SPECS.md](.github/FIGMA_DESIGN_SPECS.md) - When building UI components
4. **Architecture:** [EXECUTION_PLAN.md](.github/EXECUTION_PLAN.md) - For system design questions

---

## 🎯 Next Action

**YOU HAVE 38 HOURS. START NOW!**

Open [MASTER_EXECUTION_PLAN.md](.github/MASTER_EXECUTION_PLAN.md) and follow Block 1: Project Initialization.

---

**Document Version:** 1.0.0  
**Last Updated:** January 8, 2026  
**All planning documents are compatible and cross-referenced.**
