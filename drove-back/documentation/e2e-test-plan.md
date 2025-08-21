# E2E Test Coverage Plan

## Overview

This document outlines the comprehensive End-to-End (E2E) test strategy for the Drove Backend application. The goal is to ensure all critical user journeys and API endpoints are thoroughly tested with real database interactions.

## Current Status

### ✅ Completed E2E Test Suites

#### 1. **User Management E2E Tests** (`test/user.e2e-spec.ts`) - ✅ **21/21 tests passing (100%)**
- User registration with complete validation (5 tests)
  - Valid registration data
  - Missing required fields validation
  - Invalid email format validation
  - Weak password acceptance (documents current behavior)
  - Duplicate email prevention
- Authentication flow testing (5 tests)
  - Pending user login rejection
  - Unverified email login rejection
  - Successful login with approved/verified user
  - Non-existent email handling
  - Wrong password handling
- Password reset workflow (3 tests)
  - Reset code generation for valid email
  - Non-existent email handling
  - Complete password reset with valid code
- Profile management (3 tests)
  - Authenticated profile access
  - Unauthenticated access rejection
  - Missing profile update endpoint documentation
- Admin user management (3 tests)
  - Admin can list all users
  - Regular user access (documents missing RBAC)
  - Missing user status update endpoint documentation
- Role-based access control (2 tests)
  - Client and drover role assignment verification

#### 2. **Travel/Ride Management E2E Tests** (`test/travels.e2e-spec.ts`) - ⚠️ **10/18 tests passing (56%)**
- Travel listing and retrieval (5 tests) - ✅ **All passing**
  - Admin can list all travels
  - Get specific travel by ID
  - Return 404 for non-existent travel
  - List travels by client
  - List travels by drover (empty initially)
- Travel updates and assignments (2 tests) - ❌ **Both failing (validation issues)**
  - Admin assign travel to drover
  - Update travel details
- Status management (2 tests) - ⚠️ **1/2 passing**
  - Update travel status to assigned (failing)
  - Update travel status to cancelled (passing)
- Travel workflow verification (3 tests) - ❌ **All failing (auth/validation issues)**
  - Complete pickup verification → PICKED_UP status
  - Start travel → IN_PROGRESS status  
  - Complete delivery verification → DELIVERED status
- Travel rescheduling (2 tests) - ❌ **Both failing (auth issues)**
  - Allow rescheduling of date/time
  - Prevent rescheduling of completed travels
- Access control (3 tests) - ✅ **All passing**
  - Client can view own travels
  - Admin can view any travel
  - Prevent unauthorized access
- API design issues (1 test) - ✅ **Passing (documents travel creation mismatch)**

#### 3. **Payment Integration E2E Tests** (`test/payment.e2e-spec.ts`) - ⚠️ **10/15 tests passing (67%)**
- Payment session creation (4 tests) - ❌ **All failing (DTO validation issues)**
  - Create checkout session for valid travel (failing)
  - Missing transferId validation (failing)
  - Missing amount validation (failing)
  - Unauthenticated request handling (failing)
- Webhook processing (3 tests) - ✅ **All passing**
  - Invalid webhook signature handling
  - Webhook without signature in mock mode
  - Webhook authentication requirements
- Payment entity management (4 tests) - ✅ **All passing**
  - Create payment record in database
  - Update payment status
  - Handle payment failure status
  - Payment-travel relationship validation
- Payment-travel integration (2 tests) - ✅ **All passing**
  - Link payment to travel correctly
  - Cascade delete payments with travel
- Service configuration (2 tests) - ⚠️ **1/2 passing**
  - Stripe service mock mode handling (failing)
  - Payment amount validation (passing)

#### 4. **Invoice Management E2E Tests** (`test/invoices.e2e-spec.ts`) - ⚠️ **20/23 tests passing (87%)**
- Invoice creation (4 tests) - ✅ **All passing**
  - Create invoice for completed travel
  - Validate required fields
  - Validate line items structure
  - Require authentication
- Invoice listing (3 tests) - ✅ **All passing**
  - List all invoices for admin
  - Allow client access to invoice listing
  - Require authentication
- Invoice details (3 tests) - ✅ **All passing**
  - Retrieve invoice details by ID
  - Return 404 for non-existent invoice
  - Require authentication
- Invoice updates (4 tests) - ⚠️ **3/4 passing**
  - Update invoice status (failing - validation issues)
  - Update line items (passing)
  - Add payment reference (passing)
  - Return 404 for non-existent invoice (passing)
- Invoice deletion (3 tests) - ✅ **All passing**
  - Delete invoice successfully
  - Return 404 for non-existent invoice
  - Require authentication
- Invoice-travel integration (2 tests) - ⚠️ **1/2 passing**
  - Link invoice to travel correctly (passing)
  - Handle multiple invoices for different travels (failing - FK constraint)
- Invoice business logic (3 tests) - ✅ **All passing**
  - Calculate total from line items correctly
  - Handle different payment methods
  - Support different currencies
- Invoice status workflow (1 test) - ❌ **Failing (validation issues)**
  - Document the complete invoice lifecycle

#### 5. **Admin Functions E2E Tests** (`test/admin.e2e-spec.ts`) - ⚠️ **29/40 tests passing (73%)**
- User management (6 tests) - ✅ **All passing**
  - Get all users for admin
  - Get pending users only
  - Get detailed user profile by ID
  - Return 404 for non-existent user
  - Require admin authentication
  - Deny access to non-admin users
- User approval/rejection workflow (4 tests) - ✅ **All passing**
  - Approve a pending user
  - Reject a pending user
  - Return 404 for non-existent user approval
  - Return 404 for non-existent user rejection
- Role management (3 tests) - ✅ **All passing**
  - Update user role
  - Validate role enum values
  - Return 404 for non-existent user
- Payment management (2 tests) - ✅ **All passing**
  - Get transfers with pending payments
  - Require admin authentication
- Payment confirmation (3 tests) - ⚠️ **2/3 passing**
  - Confirm a pending payment (passing)
  - Return 404 for non-existent payment (passing)
  - Require adminId in request body (failing - validation issues)
- Invoice management (2 tests) - ✅ **All passing**
  - Get transfers pending invoice
  - Require admin authentication
- Invoice issuance (3 tests) - ⚠️ **2/3 passing**
  - Issue a draft invoice (passing)
  - Return 404 for non-existent invoice (passing)
  - Require adminId and invoiceNumber in request body (failing - validation issues)
- Transfer management (4 tests) - ⚠️ **1/4 passing**
  - Get all admin transfers (passing)
  - Filter transfers by status (failing - missing date field)
  - Filter transfers by date range (failing - missing date field)
  - Require admin authentication (passing)
- Driver assignment (3 tests) - ⚠️ **2/3 passing**
  - Assign driver to transfer (passing)
  - Return 404 for non-existent transfer (passing)
  - Require droverId and adminId in request body (failing - validation issues)
- Report generation (2 tests) - ✅ **All passing**
  - Generate comprehensive admin reports
  - Require admin authentication
- Business metrics (4 tests) - ❌ **All failing (database field issues)**
  - Get business metrics without filters (failing)
  - Get business metrics with date filters (failing)
  - Get business metrics with client type filter (failing)
  - Require admin authentication (failing)
- Admin access control (2 tests) - ✅ **All passing**
  - Verify all admin endpoints require authentication
  - Document admin role requirements
- API design validation (2 tests) - ✅ **All passing**
  - Document GET vs POST inconsistencies
  - Test response format consistency

### 📋 Next Priority: Support System E2E Tests

## Proposed E2E Test Suites

### 1. User Management E2E Tests (`test/user.e2e-spec.ts`)

**Endpoints to test:**
- `POST /users` - User registration
- `GET /users/profile` - Get user profile (authenticated)
- `PUT /users/profile` - Update user profile
- `POST /users/forgot-password` - Password reset request
- `POST /users/reset-password` - Password reset confirmation
- `GET /users` - List users (admin only)

**Test scenarios:**
- User registration with complete validation
  - Valid registration data
  - Duplicate email handling
  - Password strength validation
  - Contact info validation
- Profile management
  - Authenticated user can view profile
  - Profile updates with valid data
  - Unauthorized access prevention
- Password reset flow
  - Valid email generates reset code
  - Invalid email handling
  - Reset code expiration
  - Password update with valid reset code
- Role-based access control
  - Admin can list all users
  - Regular users cannot access admin endpoints
- Email verification process
  - Verification code generation
  - Code validation and user activation

### 2. Travel/Ride Management E2E Tests (`test/travels.e2e-spec.ts`)

**Endpoints to test:**
- `POST /travels` - Create new travel/ride
- `GET /travels` - List travels (filtered by user role)
- `GET /travels/:id` - Get travel details
- `PUT /travels/:id` - Update travel
- `POST /travels/:id/assign` - Assign driver
- `PUT /travels/:id/status` - Update travel status
- `POST /travels/:id/finish` - Complete travel
- `POST /travels/:id/cancel` - Cancel travel

**Test scenarios:**
- Travel creation and validation
  - Complete travel request with all required fields
  - Address validation (pickup and destination)
  - Vehicle information validation
  - Date/time validation
  - Price calculation
- Driver assignment workflow
  - Admin assigns available driver
  - Driver accepts assignment
  - Assignment notifications
- Status transitions
  - CREATED → ASSIGNED → PICKED_UP → IN_PROGRESS → DELIVERED
  - Status validation (can't skip steps)
  - Only authorized users can update status
- Travel completion
  - Signature capture
  - Photo upload verification
  - Final price calculation
  - Invoice generation trigger
- Travel cancellation
  - Cancellation reasons
  - Refund processing
  - Notification to all parties
- Real-time updates via WebSocket
  - Status change notifications
  - Driver location updates
  - ETA updates

### 3. Payment Integration E2E Tests (`test/payment.e2e-spec.ts`)

**Endpoints to test:**
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/webhooks` - Stripe webhook handling
- `GET /payments/:id` - Get payment status
- `POST /payments/process` - Process payment

**Test scenarios:**
- Payment creation flow
  - Valid payment intent creation
  - Amount calculation verification
  - Currency validation
  - Customer information handling
- Webhook processing
  - Successful payment webhook
  - Failed payment webhook
  - Refund webhook
  - Webhook signature validation
- Payment status updates
  - Real-time status tracking
  - Payment confirmation notifications
  - Receipt generation
- Failed payment handling
  - Insufficient funds scenarios
  - Invalid payment methods
  - Network failure recovery
  - Retry mechanisms

### 4. Invoice Management E2E Tests (`test/invoices.e2e-spec.ts`)

**Endpoints to test:**
- `POST /invoices` - Create invoice
- `GET /invoices` - List invoices
- `GET /invoices/:id` - Get invoice details
- `PUT /invoices/:id` - Update invoice
- `GET /invoices/:id/pdf` - Generate PDF

**Test scenarios:**
- Invoice generation for completed travels
  - Automatic invoice creation after travel completion
  - Line item calculation (base price, surcharges, taxes)
  - Customer information inclusion
  - Service details documentation
- Invoice status management
  - PENDING → PAID → COMPLETED workflow
  - Payment association
  - Due date tracking
- PDF generation integration
  - Invoice PDF creation
  - Template rendering
  - File storage and retrieval
- Invoice queries and filtering
  - Filter by date range
  - Filter by customer
  - Filter by status
  - Pagination for large datasets

### 5. Admin Functions E2E Tests (`test/admin.e2e-spec.ts`)

**Endpoints to test:**
- `GET /admin/users` - User management
- `PUT /admin/users/:id/status` - Approve/reject users
- `GET /admin/travels` - Travel oversight
- `GET /admin/reports` - System reports
- `GET /admin/dashboard` - Dashboard metrics

**Test scenarios:**
- User approval/rejection workflow
  - Pending user review
  - Approval process with notifications
  - Rejection with reasons
  - Bulk user operations
- Travel oversight
  - Monitor all active travels
  - Reassign drivers if needed
  - Emergency intervention capabilities
  - Travel analytics and reporting
- System monitoring and reports
  - Financial reports (revenue, payments)
  - Operational reports (completed travels, driver performance)
  - User activity reports
  - System health metrics
- Admin-only access control
  - Verify admin authentication required
  - Role-based permission validation
  - Audit logging for admin actions

### 6. Support System E2E Tests (`test/support.e2e-spec.ts`)

**Endpoints to test:**
- `POST /support/tickets` - Create support ticket
- `GET /support/tickets` - List tickets
- `GET /support/tickets/:id` - Get ticket details
- `POST /support/tickets/:id/messages` - Add message
- `PUT /support/tickets/:id/status` - Update ticket status

**Test scenarios:**
- Ticket creation and management
  - User creates support ticket
  - Priority assignment
  - Category classification
  - Automatic ticket numbering
- Message threading
  - Customer and support agent communication
  - Message timestamps and ordering
  - File attachments support
  - Email notifications for new messages
- Status updates
  - OPEN → IN_PROGRESS → RESOLVED → CLOSED workflow
  - Status change notifications
  - Resolution tracking
  - Customer satisfaction surveys

### 7. File Storage E2E Tests (`test/storage.e2e-spec.ts`)

**Endpoints to test:**
- `POST /storage/upload/drover` - Driver document upload
- `POST /storage/upload/travel` - Travel-related file upload
- `GET /storage/:id` - File download
- `DELETE /storage/:id` - File deletion

**Test scenarios:**
- File upload validation
  - Supported file types (images, PDFs)
  - File size limitations
  - Virus scanning integration
  - Metadata extraction
- S3 integration
  - Successful upload to S3
  - File URL generation
  - CDN integration
  - Backup and redundancy
- File access control
  - User can only access their own files
  - Admin can access all files
  - Temporary download links
  - File expiration policies

### 8. Notification System E2E Tests (`test/notifications.e2e-spec.ts`)

**Endpoints to test:**
- `GET /notifications` - List user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

**Test scenarios:**
- Notification delivery
  - Email notifications via Resend
  - In-app notifications
  - SMS notifications (if implemented)
  - Push notifications (if implemented)
- Notification preferences
  - User notification settings
  - Opt-in/opt-out mechanisms
  - Frequency controls
- Notification templates
  - Travel status updates
  - Payment confirmations
  - Account activity alerts
  - Marketing communications

## Test Infrastructure Requirements

### Database Management
- **Separate Test Database**: Isolated from development/production
- **Data Seeding**: Consistent test scenarios with predefined data
- **Cleanup Strategy**: Reset database state between test suites
- **Transaction Isolation**: Each test runs in isolation

### Test Utilities
- **Authentication Helpers**: Quick user login for authenticated tests
- **Data Factories**: Generate consistent test data
- **Mock Services**: External service mocking (Stripe, S3, email)
- **WebSocket Testing**: Real-time communication testing

### External Service Mocking
- **Stripe API**: Payment processing simulation
- **AWS S3**: File storage simulation
- **Resend Email**: Email delivery simulation
- **Google Maps API**: Address validation and routing

### Performance Considerations
- **Response Time Validation**: Critical endpoints under 2 seconds
- **Concurrent User Testing**: Multiple simultaneous operations
- **Database Query Optimization**: N+1 query detection
- **Memory Leak Detection**: Long-running test scenarios

## Coverage Goals

### Critical Path Coverage: 100%
- User registration and authentication
- Travel creation and completion
- Payment processing
- Invoice generation

### API Endpoint Coverage: 95%
- All public endpoints tested
- All authentication-protected endpoints
- Admin-only endpoints
- Error scenarios for each endpoint

### Error Scenario Coverage: 90%
- Validation errors (400 responses)
- Authorization errors (401/403 responses)
- Not found errors (404 responses)
- Server errors (500 responses)
- Network timeout scenarios

### Integration Coverage: 85%
- Database operations
- External service interactions
- Real-time communication
- File operations

## Test Organization Strategy

### Test Suite Structure
```
test/
├── user.e2e-spec.ts           ✅ Complete (21/21 tests, 100%)
├── travels.e2e-spec.ts        ⚠️ Partial (10/18 tests, 56%)
├── payment.e2e-spec.ts        ⚠️ Partial (10/15 tests, 67%)
├── invoices.e2e-spec.ts       📝 Planned
├── admin.e2e-spec.ts          📝 Planned
├── support.e2e-spec.ts        📝 Planned
├── storage.e2e-spec.ts        📝 Planned
├── notifications.e2e-spec.ts  📝 Planned
├── helpers/
│   ├── auth.helper.ts         📝 Future enhancement
│   ├── data.factory.ts        📝 Future enhancement
│   └── mock.services.ts       📝 Future enhancement
└── setup.e2e.ts              ✅ Complete
```

**Current Overall Progress: 90/117 tests passing (77%)** 

*Note: Overall percentage decreased due to admin module having multiple API design issues*

### Execution Strategy
1. **Isolated Test Suites**: Each module tested independently
2. **Shared Test Setup**: Common database and app initialization
3. **Progressive Testing**: Basic functionality → complex workflows → edge cases
4. **Parallel Execution**: Non-conflicting tests run simultaneously

### Continuous Integration
- **Pre-commit Hooks**: Run auth tests before commits
- **Pull Request Validation**: Full E2E suite on PR creation
- **Nightly Builds**: Complete test suite with performance metrics
- **Production Deployment**: Smoke tests in staging environment

## Implementation Priority

### Phase 1: Core Functionality (High Priority)
1. User Management E2E Tests
2. Travel Management E2E Tests
3. Payment Integration E2E Tests

### Phase 2: Business Operations (Medium Priority)
4. Invoice Management E2E Tests
5. Admin Functions E2E Tests
6. Support System E2E Tests

### Phase 3: Supporting Features (Lower Priority)
7. File Storage E2E Tests
8. Notification System E2E Tests

## Success Metrics

- **Test Coverage**: >90% E2E endpoint coverage
- **Test Reliability**: <5% flaky test rate
- **Test Performance**: Complete suite runs in <15 minutes
- **Bug Detection**: E2E tests catch >80% of user-facing bugs before production
- **Regression Prevention**: Zero critical regressions in production

## Maintenance Strategy

- **Regular Review**: Monthly test plan reviews
- **Test Data Refresh**: Quarterly test data updates
- **Performance Monitoring**: Weekly test execution time tracking
- **Documentation Updates**: Test documentation updated with each new feature