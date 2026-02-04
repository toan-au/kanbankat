# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KanbanKat is a full-stack kanban-style project management web application with OAuth2 JWT authentication. The project is split into two main parts:
- **Server**: Express.js REST API (TypeScript) located in `server/`
- **Client**: React/Vite SPA (TypeScript) with Redux state management located in `client-vite/`

## Development Commands

### Root Level
- `npm install` - Installs dependencies for both client and server
- `npm run dev` - Starts both server and client concurrently (server on dev mode, client on vite)
- `npm run server` - Start server only in dev mode
- `npm run client` - Start client only in dev mode

### Server (`server/`)
- `npm run dev` - Start development server with ts-node-dev (hot reload)
- `npm run build` - Compile TypeScript to JavaScript (outputs to `dist/`)
- `npm start` - Run production server (requires build first)
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

### Client (`client-vite/`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production (runs TypeScript compiler + Vite build)
- `npm run lint` - Run ESLint on TypeScript/TSX files
- `npm run preview` - Preview production build

## Architecture

### Server Architecture

The server follows a layered Express.js architecture:

**Entry Point**: `server/src/server.ts` → imports `server/src/app.ts`

**Layers**:
1. **Routes** (`server/src/routes/`): Define API endpoints and wire up middleware
2. **Controllers** (`server/src/controllers/`): Handle business logic for routes
3. **Services** (`server/src/services/`): Optional service layer for complex operations
4. **Models** (`server/src/models/`): Mongoose schemas and models
5. **Middleware** (`server/src/middleware/`): Custom middleware (auth, error handling, async wrapper)

**Key Middleware**:
- `requireLogin`: Ensures user is authenticated
- `requireOwnBoard`: Ensures user owns the board they're accessing
- `asyncHandler`: Wraps async route handlers to catch errors
- `handleErrors`: Global error handler
- `forceHttps`: Forces HTTPS in production

**Authentication**:
- Uses Passport.js with Google OAuth2 and GitHub OAuth strategies
- Configuration in `server/src/auth/passport.ts`
- Session management with `cookie-session`

**Data Model** (Mongoose):
- **User**: Stores OAuth profile (googleId/githubId, displayName)
- **Board**: Contains lists, belongs to a user, has labels
  - Nested schema: **List** contains tasks
  - Nested schema: **Task** has name, content, color
- **Label**: Color-coded labels for tasks, linked to boards

**Note**: The schema variable is named `baordSchema` (typo) in `server/src/models/board.model.ts:27`

### Client Architecture

The client is a React SPA using Vite as the build tool:

**State Management**: Redux Toolkit with three slices:
- `boards`: Manages board/list/task data and CRUD operations
- `currentUser`: Manages authenticated user state
- `ui`: Manages UI state (modals, menus, etc.)

**Routing**: React Router with route structure:
- `/` - Home/Landing page
- `/dashboard` - User's boards dashboard
- `/board/:boardId` - Individual board view
- `/settings` - User settings

**Key Patterns**:
- Redux async thunks for API calls (e.g., `createBoardAsync`, `getBoardAsync`)
- Axios for HTTP requests to backend API
- React Beautiful DnD for drag-and-drop functionality
- Tailwind CSS for styling with Radix UI components
- Path alias `@/*` maps to `./src/*`

**Component Structure**:
- `pages/`: Top-level page components
- `components/board/`: Board-specific components (List, Task, etc.)
- `components/dashboard/`: Dashboard-specific components
- `components/UI/`: Reusable UI components
- `components/templates/`: Layout templates and auth guards

### API Endpoints

All API routes are prefixed with `/api` except auth routes (`/auth`):

**Boards**:
- `POST /api/board` - Create board
- `GET /api/boards` - Get user's boards (query param `deleted` for archived)
- `GET /api/board/:boardId` - Get single board
- `PATCH /api/board/:boardId` - Update board (name, deleted status)
- `DELETE /api/board/:boardId` - Soft delete board (archive)
- `DELETE /api/board/destroy/:boardId` - Hard delete board
- `PATCH /api/board/:boardId/lists` - Reorder lists

**Lists**:
- `POST /api/board/:boardId/list` - Create list
- `PATCH /api/board/:boardId/list/:listId` - Update list
- `DELETE /api/board/:boardId/list/:listId` - Delete list
- `PATCH /api/board/:boardId/lists/tasks` - Move task between lists

**Tasks**:
- `POST /api/board/:boardId/list/:listId/task` - Create task
- `PATCH /api/board/:boardId/list/:listId/task/:taskId` - Update task
- `DELETE /api/board/:boardId/list/:listId/task/:taskId` - Delete task

**Labels**:
- Label endpoints in `server/src/routes/label.ts` (prefixed with `/api`)

**Auth**:
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - GitHub OAuth callback
- Auth routes defined in `server/src/routes/auth.ts`

## Configuration

**Server Environment**: Requires `server/config/keys.js` (or `.env` file at `server/config/.env`) with:
- Database connection string (MongoDB)
- OAuth credentials (Google, GitHub)
- Cookie session key

**Client**: Vite proxy configuration may be in `client-vite/vite.config.ts` for API requests

**TypeScript**: Both client and server use strict mode with different module systems:
- Server: CommonJS (`module: "commonjs"`)
- Client: ESNext (`module: "ESNext"`) with React JSX

## Testing

Tests are located in `server/src/__tests__/` using Jest. Test fixtures in `server/src/__tests__/board.fixture.json`.

To run a single test file:
```bash
cd server
npm test -- <test-file-name>
```

## Important Notes

- The server uses `ts-node-dev` for development with auto-reload
- Client uses Vite's HMR for fast development
- Board deletion is soft delete by default (sets `deleted: true`, `deletedOn: Date`)
- Default labels are automatically created when a new board is created (see `server/src/models/board.model.ts:5-12`)
- Session cookie max age is 30 days
