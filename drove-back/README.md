# Drove Backend

A NestJS-based backend application for a transportation/ride-sharing service. This application handles user management, ride coordination, payments, and various other features essential for a modern transportation platform.

## Features

- User authentication and authorization
- Travel/ride management
- Payment processing with Stripe
- Invoice generation
- File storage with AWS S3
- Email notifications via Resend
- PDF generation
- Support ticket system
- User reviews
- Dynamic pricing

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js >=20.0.0 (for local development)

### Running with Docker Compose

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Start the application:
```bash
docker compose up
```

The application will be available at http://localhost:3000 (or the port specified in your .env file).

### Local Development

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn start:dev
```

### Running Tests

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# test coverage
yarn test:cov
```

## Environment Variables

Copy `.env.example` to `.env` and adjust the following variables:

```env
# App
PORT=3000
NODE_ENV=development

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=drove
POSTGRES_PORT=5432
```

## Project Structure

```
src/
├── admin/          # Admin dashboard functionality
├── auth/           # Authentication and authorization
├── invoices/       # Invoice generation and management
├── notifications/  # User notifications
├── payment/        # Payment processing (Stripe)
├── pdf/            # PDF generation
├── rates/          # Dynamic pricing
├── resend/         # Email service integration
├── reviews/        # User review system
├── storage/        # File storage (AWS S3)
├── tickets/        # Support ticket system
├── travels/        # Core travel/ride functionality
├── user/           # User management
└── verifications/  # User verification system
```

## API Documentation

API documentation is available at `/api` when running in development mode.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

