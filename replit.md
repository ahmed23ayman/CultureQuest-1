# Calculator App

## Overview

This is a full-stack calculator application built with React frontend and Express backend. The app features a modern, responsive calculator interface with comprehensive mathematical operations and error handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reload with tsx

## Key Components

### Frontend Components
- **Calculator**: Main calculator interface with number pad, operators, and display
- **UI Components**: Comprehensive set of reusable components from shadcn/ui
- **Routing**: Simple routing setup with calculator as home page and 404 handling
- **Query Client**: Configured for API communication with authentication handling

### Backend Components
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **Database Schema**: User table with username/password fields
- **API Routes**: Express routes with `/api` prefix (currently empty but structured)
- **Middleware**: Request logging, JSON parsing, and error handling

### Database Schema
- **Users Table**: Basic user authentication structure
  - `id`: Serial primary key
  - `username`: Unique text field
  - `password`: Text field for hashed passwords

## Data Flow

1. **Frontend**: React components manage local calculator state
2. **API Communication**: React Query handles server requests with credentials
3. **Backend**: Express routes process API requests
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Storage**: Abstract storage interface allows for different implementations

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Wouter for lightweight routing
- React Hook Form with Zod validation

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database operations
- Neon Database for serverless PostgreSQL
- Session management with connect-pg-simple

### Development Tools
- Vite for frontend build and development
- TypeScript for type safety
- ESBuild for backend bundling
- Replit-specific plugins for development environment

## Deployment Strategy

### Development
- Frontend: Vite dev server with hot reload
- Backend: tsx for TypeScript execution with auto-restart
- Database: Neon Database with environment-based connection

### Production
- Frontend: Vite build to static files served by Express
- Backend: ESBuild bundle to single JavaScript file
- Database: Production Neon Database instance
- Server: Node.js execution of bundled backend

### Build Process
1. `npm run build`: Builds frontend assets and bundles backend
2. `npm start`: Runs production server serving static files and API
3. `npm run db:push`: Applies database schema changes

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- Session configuration for authentication
- Vite configuration for asset handling and aliases

The application is structured as a monorepo with clear separation between client, server, and shared code. The architecture supports both development and production environments with appropriate tooling and optimization strategies.