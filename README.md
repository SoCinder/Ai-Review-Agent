# DevPilot 2026 - AI-Augmented Developer Collaboration Platform

**Course:** COMP-308 Emerging Technologies  
**Assignment:** Lab 3 - Project Milestone

---

## Project Structure

```
devpilot-2026-milestone/
├── backend/
│   ├── auth-service/          # Authentication subgraph (port 4001)
│   │   ├── models/User.js     # User model with bcrypt password hashing
│   │   ├── schema.js          # GraphQL type definitions (User, login, register, logout)
│   │   ├── resolvers.js       # Auth resolvers with session management
│   │   └── server.js          # Express + Apollo Server + session middleware
│   ├── projects-service/      # Projects subgraph (port 4002)
│   │   ├── models/
│   │   │   ├── Project.js             # Project model
│   │   │   ├── FeatureRequest.js      # Feature request model
│   │   │   └── ImplementationDraft.js # Implementation draft model
│   │   ├── schema.js          # GraphQL type definitions (Project, FeatureRequest, ImplementationDraft)
│   │   ├── resolvers.js       # CRUD resolvers for projects, features, and drafts
│   │   └── server.js          # Express + Apollo Server
│   └── gateway/               # Apollo Gateway (port 4000)
│       └── server.js          # Federates auth + projects subgraphs, forwards cookies
├── frontend/
│   ├── shell/                 # Shell App - Host (port 3000)
│   │   ├── src/
│   │   │   ├── App.jsx        # Main app with routing, auth state, ApolloProvider
│   │   │   ├── apolloClient.js # Shared Apollo Client instance
│   │   │   └── components/
│   │   │       └── LoginForm.jsx # Login/Register form
│   │   └── vite.config.js     # Module Federation host config
│   ├── projects-app/          # Projects App - Remote (port 3001)
│   │   ├── src/
│   │   │   ├── App.jsx        # Project list + create project
│   │   │   ├── ProjectDetail.jsx # Project detail + feature request management
│   │   │   └── FeatureItem.jsx   # Feature item with draft submission/viewing
│   │   └── vite.config.js     # Module Federation remote config
│   └── ai-review-app/         # AI Review App - Remote (port 3002)
│       ├── src/App.jsx        # Placeholder for AI review features
│       └── vite.config.js     # Module Federation remote config
```

## How to Run

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection (configured in `.env` files)

### Starting the Backend Services

Each backend service needs to be started in its own terminal:

```bash
# Terminal 1 - Auth Service (port 4001)
cd backend/auth-service
npm install
node server.js

# Terminal 2 - Projects Service (port 4002)
cd backend/projects-service
npm install
node server.js

# Terminal 3 - Apollo Gateway (port 4000)
cd backend/gateway
npm install
node server.js
```

### Starting the Frontend Apps

Each frontend app needs to be started in its own terminal:

```bash
# Terminal 4 - Shell App / Host (port 3000)
cd frontend/shell
npm install
npm run dev

# Terminal 5 - Projects App / Remote (port 3001)
cd frontend/projects-app
npm install
npm run dev

# Terminal 6 - AI Review App / Remote (port 3002)
cd frontend/ai-review-app
npm install
npm run dev
```

Once all services are running, open **http://localhost:3000** in your browser.

## How Authentication Works

The application uses **server-side session-based authentication** with HTTP-only cookies:

1. **Registration/Login:** The user submits credentials via the LoginForm component. The Shell sends a GraphQL mutation to the Apollo Gateway, which forwards it to the Auth Service.
2. **Session Creation:** On successful login, the Auth Service creates a server-side session stored in MongoDB (via `connect-mongo`). A session ID is sent back as an **HTTP-only cookie** — it is never accessible to JavaScript.
3. **Session Persistence:** The session cookie is automatically sent with every subsequent request. The Apollo Gateway forwards cookies to subgraphs, allowing them to identify the authenticated user.
4. **Protected Routes:** Both the frontend (React Router redirects) and backend (resolver-level `user` checks) enforce authentication. Unauthenticated users are redirected to the login page.
5. **Logout:** The session is destroyed server-side, and the cookie is invalidated.

**Security choices:**
- No JWT or localStorage tokens — prevents XSS token theft
- HTTP-only cookies — not accessible via `document.cookie`
- MongoDB session store — sessions persist across server restarts
- Passwords hashed with bcrypt via a Mongoose pre-save hook

## Completed for This Lab (Milestone)

- **Part A - Authentication Foundation (20%):** Full user registration, login, logout, and session-based auth with HTTP-only cookies and MongoDB session store
- **Part B - Projects Foundation (25%):** Complete CRUD for projects, feature requests, and implementation drafts — both backend (GraphQL schema, resolvers, Mongoose models) and frontend (project list, project detail, feature request forms, draft submission, draft history)
- **Part C - Micro Frontend Foundation (20%):** Shell App (host) with Module Federation loading Projects App and AI Review App as remotes. Shared Apollo Client owned by the Shell and passed to remotes via ApolloProvider
- **Apollo Gateway Integration (15%):** Single `/graphql` endpoint federating auth and projects subgraphs with cookie forwarding

## Planned for Final Project

- **AI Review App:** Full implementation of AI-powered code review features using an LLM API, including review requests, AI-generated feedback, and review history
- **Real-time Collaboration:** WebSocket or subscription-based live updates for project activity
- **Enhanced User Profiles:** User settings, avatar uploads, notification preferences
- **Role-Based Access Control:** Differentiated permissions for developers, reviewers, and project owners
- **Deployment:** Containerized deployment with Docker and CI/CD pipeline

## Emerging Technologies Lab Assignment 3 Contribution
Group 5 - DevPilot 2026

Team Member Name                 Contribution
Jan Fontanilla - 301380907       Part B - Projects Foundation
Umer Haider - 301350936          Setup the frontend and backend architecture
Tien Minh Dang  -301411970       Polishing part A and C based on QA feedback
Holly Edwards-Kiss - 301249567   Recorded demo video
