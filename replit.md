# Car Rental System - Replit Architecture Guide

## Overview

This is a full-stack car rental application built with a modern TypeScript stack. The system provides a complete car rental platform with features for both customers and administrators. It includes car browsing, reservation management, user authentication, and administrative tools for fleet management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and bundling
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: tsx for TypeScript execution in development

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schema
- `migrations/` - Database migration files

## Key Components

### Database Schema
The application uses four main entities:
- **Users**: Customer and admin accounts with authentication
- **Cars**: Vehicle inventory with specifications and availability
- **Reservations**: Booking records linking users to cars
- **Locations**: Pickup/return locations (referenced but not fully implemented)

Key schema features:
- Role-based access (customer/admin)
- Car status tracking (available/rented/maintenance)
- Comprehensive car specifications (category, fuel type, transmission, etc.)
- Reservation lifecycle management

### Authentication System
- Simple credential-based authentication
- Role-based access control (customer/admin)
- Session-based authentication (prepared for PostgreSQL session store)

### API Layer
RESTful API with endpoints for:
- Authentication (`/api/auth/login`, `/api/auth/register`)
- Car management (`/api/cars`)
- Reservation management (`/api/reservations`)
- User management

### UI Components
Comprehensive component library built on Radix UI:
- Form components with validation
- Data tables and cards
- Modal dialogs and sheets
- Navigation and layout components
- Notification system

## Data Flow

1. **Frontend requests** are made through TanStack Query with custom query functions
2. **API routes** in Express handle business logic and data validation
3. **Storage layer** abstracts database operations (currently using in-memory storage)
4. **Database operations** will use Drizzle ORM with PostgreSQL
5. **Responses** are cached and managed by React Query on the frontend

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection for serverless PostgreSQL
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **tailwindcss**: Utility-first CSS framework
- **vite**: Frontend build tool and dev server

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for backend TypeScript execution
- Concurrent development on port 5000

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild bundles backend to `dist/index.js`
- Static file serving from Express for SPA

### Database
- Drizzle Kit for schema management and migrations
- PostgreSQL database (configured for Neon serverless)
- Environment-based connection string (`DATABASE_URL`)

### Hosting
- Configured for Replit deployment
- Autoscale deployment target
- Port 5000 mapped to external port 80

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 15, 2025**: Complete car rental application implementation
  - Built full Polish-language interface with professional UI
  - Implemented car search and filtering system with real-time updates
  - Created comprehensive reservation system with cost calculation and extras
  - Developed customer dashboard with booking history and loyalty program
  - Built admin dashboard for fleet management and reservation oversight
  - Integrated notification system for business operations
  - Added responsive design with proper Polish translations

## User Preferences

Preferred communication style: Simple, everyday language (Polish).