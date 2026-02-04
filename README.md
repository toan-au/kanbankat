# KanbanKat

A full-stack kanban-style project management web application built with modern technologies and best practices. KanbanKat demonstrates proficiency in TypeScript, React, Node.js, and cloud-ready architecture patterns.

**Live Demo:** [Coming Soon]

## Overview

KanbanKat is a production-ready task management solution inspired by Trello, featuring secure OAuth2 authentication, real-time drag-and-drop interactions, and a scalable REST API architecture. This project showcases full-stack development capabilities, from database design to responsive UI implementation.

### Key Highlights

- **Full TypeScript Implementation** - End-to-end type safety across client and server
- **Secure Authentication** - OAuth2 integration with Google and GitHub using Passport.js
- **Modern React Architecture** - Redux Toolkit for predictable state management
- **RESTful API Design** - Clean, scalable Express.js backend with layered architecture
- **Responsive UI/UX** - Tailwind CSS with Radix UI components for accessibility
- **Production Ready** - Configured for Heroku deployment with build optimization

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Vite** for blazing-fast builds and HMR
- **React Router** for client-side routing
- **React Beautiful DnD** for drag-and-drop functionality
- **Tailwind CSS** + **Radix UI** for modern, accessible components
- **Axios** for HTTP client

### Backend
- **Node.js** with **Express.js**
- **TypeScript** with strict mode
- **Passport.js** for OAuth2 authentication (Google & GitHub)
- **MongoDB** with **Mongoose** ODM
- **JWT** session-based authentication
- **Jest** + **Supertest** for API testing

### DevOps & Tools
- **ESLint** + **Prettier** for code quality
- **ts-node-dev** for development hot-reload
- **Concurrently** for parallel dev environment
- **Heroku** deployment configuration

## Architecture

### Backend Architecture

The server follows a clean, layered architecture pattern:

```
server/
├── src/
│   ├── routes/          # API endpoint definitions
│   ├── controllers/     # Business logic layer
│   ├── models/          # Mongoose schemas
│   ├── middleware/      # Auth, error handling, async wrapper
│   ├── auth/            # Passport configuration
│   └── services/        # Service layer for complex operations
```

**Key Design Patterns:**
- **Middleware Chain**: Custom async error handler wraps all routes
- **Authentication Guards**: `requireLogin` and `requireOwnBoard` middleware protect resources
- **Soft Delete Pattern**: Boards use soft deletion for data recovery
- **Nested Documents**: Lists and tasks embedded in board documents for efficiency

### Frontend Architecture

```
client-vite/
├── src/
│   ├── pages/           # Route-level components
│   ├── components/
│   │   ├── board/       # Board-specific components
│   │   ├── dashboard/   # Dashboard components
│   │   └── UI/          # Reusable components
│   ├── store/           # Redux slices (boards, currentUser, ui)
│   └── utils/           # Utilities and helpers
```

**State Management:**
- Redux Toolkit slices with async thunks for API integration
- Normalized state shape for optimal performance
- Optimistic updates for better UX

## Features

### Core Functionality
- **Board Management** - Create, update, archive, and permanently delete boards
- **List Organization** - Add lists to boards with drag-to-reorder
- **Task Management** - Create, edit, move, and delete tasks
- **Label System** - Color-coded labels with default presets
- **Drag & Drop** - Intuitive task and list reordering
- **User Dashboard** - Overview of all boards with quick access

### Authentication & Security
- OAuth2 authentication with Google and GitHub
- Session-based JWT token management
- Protected API routes with ownership validation
- HTTPS enforcement in production
- Secure cookie configuration with 30-day expiry

### User Experience
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Loading states and error handling
- Accessible UI components (ARIA-compliant)

## API Endpoints

### Boards
```
POST   /api/board                      - Create new board
GET    /api/boards                     - Get user's boards
GET    /api/board/:boardId             - Get single board
PATCH  /api/board/:boardId             - Update board
DELETE /api/board/:boardId             - Archive board (soft delete)
DELETE /api/board/destroy/:boardId     - Permanently delete board
PATCH  /api/board/:boardId/lists       - Reorder lists
```

### Lists
```
POST   /api/board/:boardId/list                    - Create list
PATCH  /api/board/:boardId/list/:listId            - Update list
DELETE /api/board/:boardId/list/:listId            - Delete list
PATCH  /api/board/:boardId/lists/tasks             - Move task between lists
```

### Tasks
```
POST   /api/board/:boardId/list/:listId/task                - Create task
PATCH  /api/board/:boardId/list/:listId/task/:taskId        - Update task
DELETE /api/board/:boardId/list/:listId/task/:taskId        - Delete task
```

### Authentication
```
GET    /auth/google                    - Initiate Google OAuth
GET    /auth/google/callback           - Google OAuth callback
GET    /auth/github                    - Initiate GitHub OAuth
GET    /auth/github/callback           - GitHub OAuth callback
```

## Getting Started

### Prerequisites

- Node.js v21.7.3 or higher
- npm 10.5.0 or higher
- MongoDB instance (local or cloud)
- Google OAuth credentials
- GitHub OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/toan-au/kanbankat.git
   cd kanbankat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This installs dependencies for both client and server.

3. **Configure environment variables**

   Create `server/config/keys.js` or `server/config/.env`:
   ```javascript
   module.exports = {
     mongoURI: 'your_mongodb_connection_string',
     cookieKey: 'your_random_cookie_key',
     googleClientID: 'your_google_client_id',
     googleClientSecret: 'your_google_client_secret',
     githubClientID: 'your_github_client_id',
     githubClientSecret: 'your_github_client_secret'
   };
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   This runs both the Express API server and Vite dev server concurrently.

### Development Commands

**Root Level:**
- `npm run dev` - Start both client and server in development mode
- `npm run server` - Start server only
- `npm run client` - Start client only

**Server (server/):**
- `npm run dev` - Start with hot-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm test` - Run Jest tests
- `npm run lint` - Lint code

**Client (client-vite/):**
- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Testing

The server includes comprehensive test coverage using Jest and Supertest:

```bash
cd server
npm test
```

Tests are located in `server/src/__tests__/` with fixtures in `board.fixture.json`.

## Deployment

The application is configured for Heroku deployment:

```bash
git push heroku master
```

The `heroku-postbuild` script automatically builds both client and server for production.

## Database Schema

### User Model
```typescript
{
  googleId: String,
  githubId: String,
  displayName: String
}
```

### Board Model
```typescript
{
  name: String,
  user: ObjectId,
  lists: [List],
  labels: [Label],
  deleted: Boolean,
  deletedOn: Date
}
```

### List Schema (embedded)
```typescript
{
  name: String,
  order: Number,
  tasks: [Task]
}
```

### Task Schema (embedded)
```typescript
{
  name: String,
  content: String,
  color: String,
  labels: [ObjectId]
}
```

## Development Practices

- **Type Safety**: Strict TypeScript configuration across the entire codebase
- **Code Quality**: ESLint with Prettier for consistent formatting
- **Error Handling**: Global error middleware with async error wrapper
- **Testing**: Unit and integration tests for API endpoints
- **Documentation**: Comprehensive code comments and JSDoc annotations
- **Version Control**: Conventional commit messages and semantic versioning

## Roadmap

- [ ] WebSocket integration for real-time collaboration
- [ ] Task comments and activity log
- [ ] File attachments for tasks
- [ ] Advanced filtering and search
- [ ] Email notifications
- [ ] Team collaboration features

## Performance Optimizations

- Vite's code splitting for faster initial load
- MongoDB indexing on user and board queries
- React component memoization for drag-and-drop
- Lazy loading of routes and components
- Production build optimization with tree-shaking

## Author

**Toan Au**
- GitHub: [@toan-au](https://github.com/toan-au)

## License

This project is licensed under the ISC License.

## Acknowledgments

- Inspired by [Trello](https://trello.com/)
- Built with modern best practices from the React and Node.js communities