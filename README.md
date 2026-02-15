# TaskBoard 📋

A full-stack collaborative task management application built with **React**, **Express**, **MongoDB**, and **Socket.IO**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Boards](#boards)
  - [Lists](#lists)
  - [Tasks](#tasks)
- [WebSocket Events](#websocket-events)
- [Database Schema](#database-schema)
- [Assumptions & Trade-offs](#assumptions--trade-offs)
- [Demo Credentials](#demo-credentials)
- [Environment Variables](#environment-variables)

---

## Overview

TaskBoard is a collaborative task management platform that enables teams to organize work across multiple boards, lists, and tasks. Key features include:

- **User Authentication** - Secure signup/login with JWT tokens
- **Board Management** - Create, manage, and share boards
- **Real-time Collaboration** - WebSocket-powered live updates across connected users
- **Task Organization** - Drag-and-drop task management across lists
- **Activity Tracking** - Audit trail of board and task changes
- **Share Tokens** - Time-limited board sharing for external access

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                   TaskBoard App                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐         ┌────────────────┐   │
│  │   Frontend       │◄───────►│   Backend      │   │
│  │   (React/Vite)   │ REST    │   (Express)    │   │
│  │                  │ & WS    │                │   │
│  └──────────────────┘         └────────────────┘   │
│         │                             │              │
│         │ Axios                       │ Mongoose    │
│         │ Socket.IO Client    Socket.IO Server     │
│         │                             │              │
│         └─────────────────┬───────────┘              │
│                           │                         │
│                    ┌──────▼─────┐                  │
│                    │  MongoDB    │                  │
│                    │  Database   │                  │
│                    └─────────────┘                  │
└─────────────────────────────────────────────────────┘
```

### Frontend Architecture

**Technology Stack:**

- React 18 with Hooks
- React Router v6 for navigation
- Axios for HTTP requests
- Socket.IO Client for real-time updates
- Vite for bundling

**Project Structure:**

```
frontend/src/
├── pages/              # Route components (Login, Dashboard, BoardPage)
├── components/         # Reusable UI components (TaskCard, TaskForm, etc.)
├── context/            # Global state (AuthContext, TaskContext)
├── api/                # API client configuration
└── main.jsx           # React entry point
```

**Key Features:**

- **AuthContext** - Manages user authentication state and JWT tokens
- **TaskContext** - Global task and board state management
- **PrivateRoute** - Route protection for authenticated pages
- **Real-time Updates** - Socket.IO integration for live task changes

### Backend Architecture

**Technology Stack:**

- Node.js with Express
- MongoDB with Mongoose ODM
- Socket.IO for WebSocket communication
- JWT for authentication
- bcryptjs for password hashing

**Project Structure:**

```
backend/src/
├── models/            # Mongoose schemas (User, Board, List, Task, Activity)
├── controllers/       # Business logic (auth, board, list, task operations)
├── routes/            # API route definitions
├── middleware/        # Auth middleware, CORS handling
└── index.js          # Express app setup and Socket.IO configuration
```

**Key Features:**

- **JWT Authentication** - Stateless token-based auth with 7-day expiry
- **MongoDB Indexing** - Optimized queries with strategic indexes
- **Real-time Sync** - Socket.IO rooms per board for instant updates
- **Cascading Deletes** - Board deletion removes associated lists and tasks
- **Activity Audit Trail** - Track all significant changes in the system

### Data Flow

1. **User Authentication**
   - User signs up/logs in
   - Backend returns JWT token
   - Frontend stores token in localStorage
   - Token included in all subsequent API requests

2. **Board Operations**
   - Create board → Emits WebSocket event to connected users
   - Update/delete board → Broadcasts changes to room participants
   - Join board → Socket joins room for that board

3. **Task Updates**
   - Create/update/move task → Emits real-time update via Socket.IO
   - All users viewing the board receive instant notifications
   - Client updates UI optimistically for better UX

---

## Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher
- **MongoDB** v5 or higher (local or cloud instance)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file** in `backend/` with the following:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/taskboard
   JWT_SECRET=your_jwt_secret_key_change_in_production
   NODE_ENV=development
   PORT=4000
   ```

4. **Start MongoDB** (if running locally):

   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Or manually
   mongod
   ```

5. **Run the backend:**

   ```bash
   npm start          # Production mode
   npm run dev        # Development with auto-reload (nodemon)
   ```

   Backend will be available at `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file** in `frontend/` with the following:

   ```env
   VITE_BACKEND_URL=http://localhost:4000
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

5. **Build for production:**
   ```bash
   npm run build      # Creates optimized build in dist/
   npm run preview    # Preview the production build locally
   ```

---

## API Documentation

### Base URL

```
http://localhost:4000/api
```

### Authentication

All authenticated endpoints require an `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

#### POST `/auth/signup`

Create a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `400` - Missing required fields
- `409` - Email already in use

---

#### POST `/auth/login`

Authenticate and receive a JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `400` - Missing email or password
- `401` - Invalid credentials

---

### Boards

#### POST `/boards` ⚡ Authenticated

Create a new board.

**Request Body:**

```json
{
  "title": "Q1 Product Roadmap"
}
```

**Response (201 Created):**

```json
{
  "board": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Q1 Product Roadmap",
    "owner": "507f1f77bcf86cd799439012",
    "collaborators": [],
    "createdAt": "2024-02-16T10:30:00Z"
  }
}
```

---

#### GET `/boards` ⚡ Authenticated

Get all boards owned by or shared with the current user.

**Query Parameters:** None

**Response (200 OK):**

```json
{
  "boards": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Q1 Product Roadmap",
      "owner": "507f1f77bcf86cd799439012",
      "collaborators": ["507f1f77bcf86cd799439013"],
      "createdAt": "2024-02-16T10:30:00Z"
    }
  ]
}
```

---

#### POST `/boards/:boardId/share` ⚡ Authenticated

Create a time-limited share token for a board (owner only).

**URL Parameters:**

- `boardId` - Board MongoDB ID

**Response (200 OK):**

```json
{
  "sharePath": "/board/507f1f77bcf86cd799439011?share=a1b2c3d4e5f6...",
  "token": "a1b2c3d4e5f6...",
  "expires": "2024-02-23T10:30:00Z"
}
```

**Error Responses:**

- `403` - Not board owner
- `404` - Board not found

---

#### POST `/boards/:boardId/save` ⚡ Authenticated

Save a shared board to the user's board list (requires valid share token).

**URL Parameters:**

- `boardId` - Board MongoDB ID

**Query Parameters:**

- `share` - Share token from the `/share` endpoint

**Response (200 OK):**

```json
{
  "message": "Board saved to your collection"
}
```

---

#### DELETE `/boards/:boardId` ⚡ Authenticated

Delete a board and all associated lists/tasks (owner only).

**URL Parameters:**

- `boardId` - Board MongoDB ID

**Response (200 OK):**

```json
{
  "message": "Board deleted"
}
```

**Error Responses:**

- `403` - Not board owner
- `404` - Board not found

---

#### GET `/boards/:boardId/users`

Get users associated with a board (owner + collaborators).

**URL Parameters:**

- `boardId` - Board MongoDB ID

**Query Parameters:**

- `share` - Share token (optional, allows non-authenticated access)

**Response (200 OK):**

```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

---

#### GET `/boards/:boardId/activities`

Get activity history for a board.

**URL Parameters:**

- `boardId` - Board MongoDB ID

**Query Parameters:**

- `share` - Share token (optional, allows non-authenticated access)

**Response (200 OK):**

```json
{
  "activities": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "task:created",
      "actorName": "John Doe",
      "data": { "title": "Implement auth" },
      "createdAt": "2024-02-16T10:30:00Z"
    }
  ]
}
```

---

### Lists

#### POST `/boards/:boardId/lists` ⚡ Authenticated

Create a new list in a board.

**URL Parameters:**

- `boardId` - Board MongoDB ID

**Request Body:**

```json
{
  "title": "To Do"
}
```

**Response (201 Created):**

```json
{
  "list": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "To Do",
    "board": "507f1f77bcf86cd799439011",
    "position": 0,
    "createdAt": "2024-02-16T10:30:00Z"
  }
}
```

---

#### GET `/boards/:boardId/lists`

Get all lists for a board.

**URL Parameters:**

- `boardId` - Board MongoDB ID

**Query Parameters:**

- `share` - Share token (optional, allows non-authenticated access)

**Response (200 OK):**

```json
{
  "lists": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "To Do",
      "board": "507f1f77bcf86cd799439011",
      "position": 0,
      "createdAt": "2024-02-16T10:30:00Z"
    }
  ]
}
```

---

#### PUT `/boards/:boardId/lists/:listId` ⚡ Authenticated

Update a list (title or position).

**URL Parameters:**

- `boardId` - Board MongoDB ID
- `listId` - List MongoDB ID

**Request Body:**

```json
{
  "title": "In Progress",
  "position": 1
}
```

**Response (200 OK):**

```json
{
  "list": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "In Progress",
    "position": 1
  }
}
```

---

#### DELETE `/boards/:boardId/lists/:listId` ⚡ Authenticated

Delete a list and all its tasks.

**URL Parameters:**

- `boardId` - Board MongoDB ID
- `listId` - List MongoDB ID

**Response (200 OK):**

```json
{
  "message": "List deleted"
}
```

---

### Tasks

#### GET `/tasks`

Get tasks with optional filtering.

**Query Parameters:**

- `board` - Filter by board ID
- `list` - Filter by list ID
- `status` - Filter by status (todo, in-progress, done)
- `assignee` - Filter by assignee ID
- `search` - Search in task title/description

**Response (200 OK):**

```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "title": "Implement authentication",
      "description": "Add JWT-based auth to backend",
      "board": "507f1f77bcf86cd799439011",
      "list": "507f1f77bcf86cd799439020",
      "assignee": "507f1f77bcf86cd799439012",
      "status": "in-progress",
      "position": 0,
      "dueDate": "2024-02-28T23:59:59Z",
      "createdAt": "2024-02-16T10:30:00Z",
      "updatedAt": "2024-02-16T11:00:00Z"
    }
  ]
}
```

---

#### POST `/tasks` ⚡ Authenticated

Create a new task.

**Request Body:**

```json
{
  "title": "Implement authentication",
  "description": "Add JWT-based auth to backend",
  "board": "507f1f77bcf86cd799439011",
  "list": "507f1f77bcf86cd799439020",
  "assignee": "507f1f77bcf86cd799439012",
  "status": "todo",
  "dueDate": "2024-02-28T23:59:59Z"
}
```

**Response (201 Created):**

```json
{
  "task": {
    "_id": "507f1f77bcf86cd799439030",
    "title": "Implement authentication",
    "description": "Add JWT-based auth to backend",
    "board": "507f1f77bcf86cd799439011",
    "list": "507f1f77bcf86cd799439020",
    "assignee": "507f1f77bcf86cd799439012",
    "status": "todo",
    "position": 0,
    "createdAt": "2024-02-16T10:30:00Z"
  }
}
```

---

#### PUT `/tasks/:id` ⚡ Authenticated

Update a task.

**URL Parameters:**

- `id` - Task MongoDB ID

**Request Body (all fields optional):**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "assignee": "507f1f77bcf86cd799439012",
  "dueDate": "2024-02-28T23:59:59Z"
}
```

**Response (200 OK):**

```json
{
  "task": {
    "_id": "507f1f77bcf86cd799439030",
    "title": "Updated title",
    ...
  }
}
```

---

#### POST `/tasks/:id/move` ⚡ Authenticated

Move a task to a different list or change its position.

**URL Parameters:**

- `id` - Task MongoDB ID

**Request Body:**

```json
{
  "list": "507f1f77bcf86cd799439021",
  "position": 2
}
```

**Response (200 OK):**

```json
{
  "task": {
    "_id": "507f1f77bcf86cd799439030",
    "list": "507f1f77bcf86cd799439021",
    "position": 2,
    ...
  }
}
```

---

#### DELETE `/tasks/:id` ⚡ Authenticated

Delete a task.

**URL Parameters:**

- `id` - Task MongoDB ID

**Response (200 OK):**

```json
{
  "message": "Task deleted"
}
```

---

## WebSocket Events

The application uses Socket.IO for real-time updates. Connection is established automatically when the app loads.

### Client Events (Frontend → Backend)

#### `joinBoard`

Notifies the server that a user is viewing a specific board.

**Payload:**

```javascript
socket.emit("joinBoard", "507f1f77bcf86cd799439011");
```

---

#### `leaveBoard`

Notifies the server that a user is no longer viewing a board.

**Payload:**

```javascript
socket.emit("leaveBoard", "507f1f77bcf86cd799439011");
```

---

### Server Events (Backend → Frontend)

#### `task:created`

A new task was created in a board.

**Payload:**

```javascript
{
  _id: "507f1f77bcf86cd799439030",
  title: "New task",
  board: "507f1f77bcf86cd799439011",
  list: "507f1f77bcf86cd799439020",
  status: "todo"
}
```

---

#### `task:updated`

An existing task was modified.

**Payload:**

```javascript
{
  _id: "507f1f77bcf86cd799439030",
  status: "in-progress"
}
```

---

#### `task:deleted`

A task was removed.

**Payload:**

```javascript
{
  taskId: "507f1f77bcf86cd799439030";
}
```

---

#### `list:created`

A new list was created in a board.

**Payload:**

```javascript
{
  _id: "507f1f77bcf86cd799439020",
  title: "To Do",
  board: "507f1f77bcf86cd799439011"
}
```

---

#### `list:updated`

A list was modified.

**Payload:**

```javascript
{
  _id: "507f1f77bcf86cd799439020",
  title: "In Progress"
}
```

---

#### `list:deleted`

A list was removed.

**Payload:**

```javascript
{
  listId: "507f1f77bcf86cd799439020";
}
```

---

## Database Schema

### User

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase),
  password: String (hashed with bcryptjs),
  createdAt: Date
}
```

**Indexes:** `{ email: 1 }`

---

### Board

```javascript
{
  _id: ObjectId,
  title: String (required, trimmed),
  owner: ObjectId (ref: User, required),
  collaborators: [ObjectId] (ref: User),
  shareToken: String (nullable),
  shareExpires: Date (nullable),
  createdAt: Date
}
```

**Indexes:** `{ owner: 1 }`

---

### List

```javascript
{
  _id: ObjectId,
  title: String (required, trimmed),
  board: ObjectId (ref: Board, required),
  position: Number (default: 0),
  createdAt: Date
}
```

**Indexes:** `{ board: 1, position: 1 }`

---

### Task

```javascript
{
  _id: ObjectId,
  title: String (required, trimmed),
  description: String (default: ''),
  board: ObjectId (ref: Board, required),
  list: ObjectId (ref: List, required),
  assignee: ObjectId (ref: User, nullable),
  status: String (enum: ['todo', 'in-progress', 'done'], default: 'todo'),
  position: Number (default: 0),
  dueDate: Date (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

- `{ board: 1, list: 1, position: 1 }`
- `{ assignee: 1 }`
- `{ board: 1, status: 1 }`

---

### Activity

```javascript
{
  _id: ObjectId,
  board: ObjectId (ref: Board, required),
  actor: ObjectId (ref: User, nullable),
  actorName: String (nullable),
  type: String (e.g., 'task:created', 'board:deleted'),
  data: Object,
  createdAt: Date
}
```

---

## Assumptions & Trade-offs

### Assumptions

1. **Single Organization** - The system assumes a single organization/workspace rather than multi-tenant architecture
2. **JWT Statelessness** - Authentication relies on JWT tokens in localStorage; no server-side session management
3. **MongoDB as Primary DB** - Assumes MongoDB is available; no support for other databases
4. **Anonymous Board Access** - Share tokens allow unauthenticated users to view shared boards but not modify them
5. **Real-time via Socket.IO** - Assumes Socket.IO is the mechanism for real-time updates; no fallback to polling
6. **Collaborative Conflicts** - Assumes optimistic updates; last-write-wins for concurrent edits

### Trade-offs

1. **No Pagination** - While MongoDB queries are optimized with indexes, large datasets may cause performance issues. Consider implementing cursor-based pagination for `GET /tasks` and activity history.

2. **Share Token Security** - Share tokens are URL-based and stateless. For sensitive boards, consider:
   - Adding rate limiting to share token generation
   - Implementing token revocation mechanism
   - Adding IP-based access controls

3. **Real-time Scalability** - Socket.IO with single server/in-memory adapter limits horizontal scaling. For production:
   - Use Redis adapter for Socket.IO to support multiple servers
   - Implement message queue (RabbitMQ/Kafka) for high-volume scenarios

4. **No Soft Deletes** - Board/list/task deletion is permanent. Consider:
   - Implementing soft deletes with recovery mechanism
   - Adding quarantine period before permanent deletion

5. **Concurrent Edit Handling** - No conflict resolution for simultaneous edits by multiple users. Consider:
   - Implementing operational transformation (OT) or CRDT
   - Adding field-level locking mechanism

6. **Password Security** - Development uses basic bcryptjs hashing. Production should:
   - Implement 2FA (two-factor authentication)
   - Add rate limiting on login attempts
   - Use environment-specific security headers

7. **Search Limitations** - Simple text search on task title/description. Consider:
   - Implementing Elasticsearch for full-text search
   - Adding advanced filters (date range, multiple assignees)

8. **No Role-Based Access Control (RBAC)** - All collaborators have equal permissions. Future versions should:
   - Support roles (Owner, Editor, Viewer)
   - Implement granular permissions per resource

9. **Activity Audit** - Activity history is append-only but consumers can still overwrite board/task data. Consider:
   - Immutable event store architecture
   - Snapshot pattern for performance

10. **CORS Configuration** - Current CORS allows all origins. Production should:
    - Restrict to specific frontend domain
    - Implement CORS with credential support for cross-site cookies

---

## Demo Credentials

Use these credentials to test the application:

### Demo User 1

```
Email:    demo1@taskboard.io
Password: Demo@123456
Name:     Alice Johnson
```

### Demo User 2

```
Email:    demo2@taskboard.io
Password: Demo@123456
Name:     Bob Smith
```

### Demo User 3

```
Email:    demo3@taskboard.io
Password: Demo@123456
Name:     Carol Williams
```

### Sample Data

The following sample data is pre-populated for demo purposes:

**Boards:**

- "Q1 2024 Planning" (owned by Alice Johnson)
- "Product Roadmap" (owned by Bob Smith, shared with Alice & Carol)
- "Team Sprint" (owned by Carol Williams)

**Lists (in each board):**

- To Do
- In Progress
- Done
- Review

**Sample Tasks:**

- Various tasks across the lists with different statuses and assignees

### Testing Scenarios

1. **Creating Tasks**
   - Log in as Demo User 1
   - Navigate to a board
   - Create a new task in the "To Do" list
   - Mark it as "In Progress"
   - Move it to "Done" list

2. **Board Sharing**
   - Log in as Demo User 2
   - Open "Product Roadmap" board
   - Click "Share" and generate a share link
   - Open in incognito window and verify read-only access

3. **Real-time Collaboration**
   - Open a board in two separate windows/browsers
   - Log in as different users
   - Create/update a task in one window
   - Verify updates appear instantly in the other window

4. **Task Search**
   - Use the search bar in the header to search for specific tasks
   - Filter boards and tasks by status

---

## Environment Variables

### Backend (`.env`)

```env
# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/taskboard
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/taskboard

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here

# Server Configuration
PORT=4000
NODE_ENV=development
```

### Frontend (`.env`)

```env
# Backend API Configuration
VITE_BACKEND_URL=http://localhost:4000
# For production:
# VITE_BACKEND_URL=https://api.taskboard.io
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseError: Cannot connect to MongoDB`

**Solution:**

1. Ensure MongoDB is running:
   ```bash
   # Check if MongoDB is running
   ps aux | grep mongod
   ```
2. Verify connection string in `.env`
3. Check firewall settings if using MongoDB Atlas

### CORS Issues

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

1. Verify `VITE_BACKEND_URL` in frontend `.env` matches backend URL
2. Check backend CORS configuration in `index.js`

### Socket.IO Connection Issues

**Error:** `WebSocket failed to connect`

**Solution:**

1. Ensure backend and frontend URLs are correctly configured
2. Check browser console for detailed error messages
3. Verify firewall allows WebSocket connections

---

## Development Tips

### Debugging

- **Backend:** Use `console.log()` statements and check terminal output
- **Frontend:** Use browser DevTools (F12) for client-side debugging
- **Socket.IO:** Add event listeners to log all incoming data:
  ```javascript
  socket.on("connect", () => console.log("Connected:", socket.id));
  socket.onAny((event, args) => console.log("Event:", event, args));
  ```

### Performance Optimization

- Database queries are indexed for common operations
- Use `position` fields for efficient drag-and-drop reordering
- Implement pagination for large task lists
- Cache frequently accessed boards in localStorage

### Code Standards

- Use async/await for asynchronous operations
- Follow RESTful conventions for API endpoints
- Keep components small and reusable
- Use meaningful variable and function names

---
