# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `yarn build` - Build the application
- `yarn start` - Start the production server
- `yarn start:dev` - Start development server with file watching
- `yarn start:debug` - Start development server with debugging enabled

### Testing
- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Run tests with coverage report
- `yarn test:e2e` - Run end-to-end tests
- `yarn test:e2e:full` - Spin up Postgres via Docker and run e2e tests
- `yarn test:e2e:report` - Run e2e tests with coverage; open `coverage-e2e/lcov-report/index.html`
- `yarn test:debug` - Run tests with debugging enabled

### Code Quality
- `yarn lint` - Lint and fix TypeScript files
- `yarn format` - Format code with Prettier

### Docker Development
- `docker compose up` - Start the full stack (app + PostgreSQL)
- Copy `.env.example` to `.env` before running Docker

## High-Level Architecture

This is a NestJS-based transportation/ride-sharing backend with modular architecture:

### Core Business Logic
- **Travels Module** (`src/travels/`) - Core ride/transfer functionality with real-time WebSocket updates via `TravelsGateway`
- **Users Module** (`src/user/`) - User management, preferences, and authentication
- **Payment Module** (`src/payment/`) - Stripe integration for payment processing
- **Invoices Module** (`src/invoices/`) - Invoice generation and management

### Supporting Services
- **Auth Module** (`src/auth/`) - JWT-based authentication with role-based access
- **Notifications Module** (`src/notifications/`) - User notification system
- **Resend Module** (`src/resend/`) - Email service with HTML templates
- **Storage Module** (`src/storage/`) - AWS S3 file storage integration
- **PDF Module** (`src/pdf/`) - PDF generation service
- **Reviews Module** (`src/reviews/`) - User review system
- **Rates Module** (`src/rates/`) - Dynamic pricing system
- **Support Module** (`src/tickets/`) - Customer support ticket system
- **Admin Module** (`src/admin/`) - Administrative functionality
- **Verifications Module** (`src/verifications/`) - User verification processes

### Database & Infrastructure
- PostgreSQL with TypeORM (entities auto-loaded from `/**/*.entity.{ts,js}`)
- Authentication middleware applied globally with specific route exclusions
- WebSocket support for real-time travel updates
- CORS configured for frontend integration

### Key Features
- Real-time travel tracking via WebSockets
- Stripe payment processing with webhooks
- Email notifications with customizable templates
- File upload handling for travel documentation
- Multi-role user system (drivers, customers, admins)
- Invoice generation and PDF creation
- Support ticket system with messaging

### Environment Setup
The application requires PostgreSQL connection environment variables (PGHOST, PGUSER, PGPASSWORD, PGDATABASE) and runs on PORT (default 3001).