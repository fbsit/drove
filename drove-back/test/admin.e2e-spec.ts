import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User, UserRole, UserStatus } from '../src/user/entities/user.entity';
import { Travels, TransferStatus } from '../src/travels/entities/travel.entity';
import { Payment, PaymentStatus } from '../src/payment/entities/payment.entity';
import { Invoice, InvoiceStatus, PaymentMethod } from '../src/invoices/entities/invoice.entity';
import { DataSource, Repository } from 'typeorm';

describe('Admin Functions (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let travelsRepository: Repository<Travels>;
  let paymentRepository: Repository<Payment>;
  let invoiceRepository: Repository<Invoice>;
  let adminToken: string;
  let clientToken: string;
  let adminUser: User;
  let clientUser: User;
  let droverUser: User;
  let pendingUser: User;
  let testTravel: Travels;
  let testPayment: Payment;
  let testInvoice: Invoice;

  const adminUserData = {
    email: 'admin@example.com',
    password: 'adminpass123',
    role: UserRole.ADMIN,
    status: UserStatus.APPROVED,
    emailVerified: true,
    contactInfo: {
      fullName: 'Admin User',
      phone: '+1234567892',
      documentId: '99999999',
      documentType: 'DNI',
      profileComplete: true
    }
  };

  const clientUserData = {
    email: 'client@example.com',
    password: 'password123',
    userType: 'client',
    contactInfo: {
      fullName: 'John Client',
      phone: '+1234567890',
      documentId: '12345678',
      documentType: 'DNI',
      profileComplete: true,
      address: '123 Main St',
      city: 'New York',
      state: 'NY'
    }
  };

  const droverUserData = {
    email: 'drover@example.com',
    password: 'droverpass123',
    userType: 'drover',
    contactInfo: {
      fullName: 'John Drover',
      phone: '+1234567891',
      documentId: '87654321',
      documentType: 'DNI',
      profileComplete: true
    }
  };

  const pendingUserData = {
    email: 'pending@example.com',
    password: 'pendingpass123',
    userType: 'client',
    contactInfo: {
      fullName: 'Pending User',
      phone: '+1234567893',
      documentId: '11111111',
      documentType: 'DNI',
      profileComplete: true
    }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    await app.init();
    
    dataSource = app.get(DataSource);
    userRepository = dataSource.getRepository(User);
    travelsRepository = dataSource.getRepository(Travels);
    paymentRepository = dataSource.getRepository(Payment);
    invoiceRepository = dataSource.getRepository(Invoice);

    // Create test users
    const bcrypt = require('bcrypt');
    
    // Create admin user
    const hashedAdminPassword = await bcrypt.hash(adminUserData.password, 10);
    adminUser = userRepository.create({
      ...adminUserData,
      password: hashedAdminPassword,
    });
    await userRepository.save(adminUser);

    // Create client user
    const clientResponse = await request(app.getHttpServer())
      .post('/users')
      .send(clientUserData)
      .expect(201);
    
    clientUser = (await userRepository.findOne({ where: { email: clientUserData.email }}))!;
    await userRepository.update(
      { email: clientUserData.email },
      { status: UserStatus.APPROVED, emailVerified: true }
    );

    // Create drover user
    const droverResponse = await request(app.getHttpServer())
      .post('/users')
      .send(droverUserData)
      .expect(201);
    
    droverUser = (await userRepository.findOne({ where: { email: droverUserData.email }}))!;
    await userRepository.update(
      { email: droverUserData.email },
      { status: UserStatus.APPROVED, emailVerified: true, role: UserRole.DROVER }
    );

    // Create pending user
    const pendingResponse = await request(app.getHttpServer())
      .post('/users')
      .send(pendingUserData)
      .expect(201);
    
    pendingUser = (await userRepository.findOne({ where: { email: pendingUserData.email }}))!;

    // Login admin to get token
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUserData.email,
        password: adminUserData.password,
      })
      .expect(201);
    adminToken = adminLogin.body.access_token;

    // Login client to get token
    const clientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: clientUserData.email,
        password: clientUserData.password,
      })
      .expect(201);
    clientToken = clientLogin.body.access_token;

    // Create test travel
    testTravel = travelsRepository.create({
      idClient: clientUser.id,
      status: TransferStatus.CREATED,
      typeVehicle: 'Sedan',
      brandVehicle: 'BMW',
      modelVehicle: '320i',
      yearVehicle: '2020',
      patentVehicle: 'ABC123',
      bastidor: 'WBA1234567890',
      startAddress: {
        city: 'Madrid',
        lat: 40.4168,
        lng: -3.7038
      },
      endAddress: {
        city: 'Barcelona',
        lat: 41.3851,
        lng: 2.1734
      },
      travelDate: '2024-01-15',
      travelTime: '10:00',
      totalPrice: 450.00,
      paymentMethod: 'card'
    });
    await travelsRepository.save(testTravel);

    // Create test payment
    testPayment = paymentRepository.create({
      status: PaymentStatus.PENDING,
      amount: 450.00,
      currency: 'EUR',
      paymentIntentId: 'pi_admin_test',
      travel: testTravel
    });
    await paymentRepository.save(testPayment);

    // Create test invoice
    testInvoice = invoiceRepository.create({
      customerId: clientUser.id,
      travelId: testTravel.id,
      invoiceDate: '2024-01-16',
      status: InvoiceStatus.DRAFT,
      paymentMethod: PaymentMethod.STRIPE,
      currency: 'EUR',
      totalAmount: 450.00,
      lineItems: [
        {
          description: 'Vehicle Transport Service',
          quantity: 1,
          unitPrice: 450.00
        }
      ]
    });
    await invoiceRepository.save(testInvoice);
  });

  afterAll(async () => {
    // Clean up all test data
    await invoiceRepository.delete({});
    await paymentRepository.delete({});
    await travelsRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('GET /admin/users - User Management', () => {
    it('should get all users for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(4); // admin, client, drover, pending
      
      // Verify user data structure
      const user = response.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('status');
    });

    it('should get pending users only', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      // All users should have PENDING status
      response.body.forEach((user: any) => {
        expect(user.status).toBe(UserStatus.PENDING);
      });
    });

    it('should get detailed user profile by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/users/${clientUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', clientUser.id);
      expect(response.body).toHaveProperty('email', clientUser.email);
      expect(response.body).toHaveProperty('totalSpent');
      expect(response.body).toHaveProperty('tripsCount');
      expect(response.body).toHaveProperty('favoriteRoutes');
      expect(response.body).toHaveProperty('vehicleStats');
      expect(response.body).toHaveProperty('contactInfo');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toContain('User not found');
    });

    it('should require admin authentication', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .expect(401);
    });

    it('should deny access to non-admin users', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${clientToken}`);

      // Should either be 403 (forbidden) or 401 (unauthorized)
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('User Approval/Rejection Workflow', () => {
    it('should approve a pending user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/users/${pendingUser.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify user status was updated
      const updatedUser = await userRepository.findOne({
        where: { id: pendingUser.id }
      });
      expect(updatedUser?.status).toBe(UserStatus.APPROVED);
    });

    it('should reject a pending user', async () => {
      // Create another pending user for rejection test
      const rejectUserData = {
        email: 'reject@example.com',
        password: 'rejectpass123',
        userType: 'client',
        contactInfo: {
          fullName: 'Reject User',
          phone: '+1234567894',
          documentId: '22222222',
          documentType: 'DNI',
          profileComplete: true
        }
      };

      const rejectResponse = await request(app.getHttpServer())
        .post('/users')
        .send(rejectUserData)
        .expect(201);
      
      const rejectUser = await userRepository.findOne({ 
        where: { email: rejectUserData.email }
      });

      const response = await request(app.getHttpServer())
        .get(`/admin/users/${rejectUser!.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify user status was updated
      const updatedUser = await userRepository.findOne({
        where: { id: rejectUser!.id }
      });
      expect(updatedUser?.status).toBe(UserStatus.REJECTED);
    });

    it('should return 404 for non-existent user approval', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users/00000000-0000-0000-0000-000000000000/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent user rejection', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users/00000000-0000-0000-0000-000000000000/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /admin/users/:id/role - Role Management', () => {
    it('should update user role', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/users/${clientUser.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.DROVER })
        .expect(200);

      expect(response.body).toBe(true);

      // Verify role was updated
      const updatedUser = await userRepository.findOne({
        where: { id: clientUser.id }
      });
      expect(updatedUser?.role).toBe(UserRole.DROVER);

      // Reset role for other tests
      await userRepository.update(
        { id: clientUser.id },
        { role: UserRole.CLIENT }
      );
    });

    it('should validate role enum values', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/users/${clientUser.id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'INVALID_ROLE' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/admin/users/00000000-0000-0000-0000-000000000000/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.CLIENT })
        .expect(404);
    });
  });

  describe('GET /admin/payments/pending - Payment Management', () => {
    it('should get transfers with pending payments', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/payments/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('payments');
      expect(Array.isArray(response.body.payments)).toBe(true);
      
      if (response.body.payments.length > 0) {
        const payment = response.body.payments[0];
        expect(payment).toHaveProperty('id');
        expect(payment).toHaveProperty('status', PaymentStatus.PENDING);
        expect(payment).toHaveProperty('travel');
      }
    });

    it('should require admin authentication', async () => {
      await request(app.getHttpServer())
        .get('/admin/payments/pending')
        .expect(401);
    });
  });

  describe('POST /admin/payments/:id/confirm - Payment Confirmation', () => {
    it('should confirm a pending payment', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/payments/${testPayment.id}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminId: adminUser.id })
        .expect(201);

      expect(response.body).toBe(true);

      // Verify payment status was updated
      const updatedPayment = await paymentRepository.findOne({
        where: { id: testPayment.id }
      });
      expect(updatedPayment?.status).toBe(PaymentStatus.CONFIRMED);
      expect(updatedPayment?.confirmedBy).toBe(adminUser.id);
      expect(updatedPayment?.confirmedAt).toBeDefined();
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/payments/99999/confirm')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminId: adminUser.id })
        .expect(404);
    });

    it('should require adminId in request body', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/payments/${testPayment.id}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Missing adminId
        .expect(400);
    });
  });

  describe('GET /admin/invoices/pending - Invoice Management', () => {
    it('should get transfers pending invoice', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/invoices/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('invoices');
      expect(Array.isArray(response.body.invoices)).toBe(true);
      
      if (response.body.invoices.length > 0) {
        const invoice = response.body.invoices[0];
        expect(invoice).toHaveProperty('id');
        expect(invoice).toHaveProperty('status', InvoiceStatus.DRAFT);
        expect(invoice).toHaveProperty('travel');
      }
    });

    it('should require admin authentication', async () => {
      await request(app.getHttpServer())
        .get('/admin/invoices/pending')
        .expect(401);
    });
  });

  describe('POST /admin/invoices/:id/issue - Invoice Issuance', () => {
    it('should issue a draft invoice', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/invoices/${testInvoice.id}/issue`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          adminId: adminUser.id,
          invoiceNumber: 'INV-2024-001'
        })
        .expect(201);

      expect(response.body).toBe(true);

      // Verify invoice status was updated
      const updatedInvoice = await invoiceRepository.findOne({
        where: { id: testInvoice.id }
      });
      expect(updatedInvoice?.status).toBe(InvoiceStatus.SENT);
      expect(updatedInvoice?.issuedBy).toBe(adminUser.id);
      expect(updatedInvoice?.issuedAt).toBeDefined();
      expect(updatedInvoice?.invoiceNumber).toBe('INV-2024-001');
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/invoices/99999/issue')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          adminId: adminUser.id,
          invoiceNumber: 'INV-2024-002'
        })
        .expect(404);
    });

    it('should require adminId and invoiceNumber in request body', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/invoices/${testInvoice.id}/issue`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });
  });

  describe('GET /admin/transfers - Transfer Management', () => {
    it('should get all admin transfers', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/transfers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transfers');
      expect(Array.isArray(response.body.transfers)).toBe(true);
      
      if (response.body.transfers.length > 0) {
        const transfer = response.body.transfers[0];
        expect(transfer).toHaveProperty('id');
        expect(transfer).toHaveProperty('status');
        expect(transfer).toHaveProperty('client');
        expect(transfer).toHaveProperty('payments');
      }
    });

    it('should filter transfers by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/transfers?status=CREATED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transfers');
      expect(Array.isArray(response.body.transfers)).toBe(true);
      
      // All returned transfers should have CREATED status
      response.body.transfers.forEach((transfer: any) => {
        expect(transfer.status).toBe(TransferStatus.CREATED);
      });
    });

    it('should filter transfers by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/transfers?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transfers');
      expect(Array.isArray(response.body.transfers)).toBe(true);
    });

    it('should require admin authentication', async () => {
      await request(app.getHttpServer())
        .get('/admin/transfers')
        .expect(401);
    });
  });

  describe('POST /admin/transfers/:id/assign - Driver Assignment', () => {
    it('should assign driver to transfer', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/transfers/${testTravel.id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          droverId: droverUser.id,
          adminId: adminUser.id
        })
        .expect(201);

      expect(response.body).toBe(true);

      // Verify transfer was updated
      const updatedTransfer = await travelsRepository.findOne({
        where: { id: testTravel.id }
      });
      expect(updatedTransfer?.droverId).toBe(droverUser.id);
      expect(updatedTransfer?.assignedBy).toBe(adminUser.id);
      expect(updatedTransfer?.assignedAt).toBeDefined();
      expect(updatedTransfer?.status).toBe(TransferStatus.ASSIGNED);
    });

    it('should return 404 for non-existent transfer', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/transfers/00000000-0000-0000-0000-000000000000/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          droverId: droverUser.id,
          adminId: adminUser.id
        })
        .expect(404);
    });

    it('should require droverId and adminId in request body', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/transfers/${testTravel.id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });
  });

  describe('GET /admin/reports - Report Generation', () => {
    it('should generate comprehensive admin reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify report structure
      expect(response.body).toHaveProperty('totalTransfers');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('activeDrivers');
      expect(response.body).toHaveProperty('completionRate');
      expect(response.body).toHaveProperty('monthlyGrowth');
      expect(response.body).toHaveProperty('transfers');
      expect(response.body).toHaveProperty('revenue');
      expect(response.body).toHaveProperty('drivers');
      expect(response.body).toHaveProperty('clients');
      expect(response.body).toHaveProperty('transferStatus');
      expect(response.body).toHaveProperty('topClients');
      expect(response.body).toHaveProperty('topDrovers');
      expect(response.body).toHaveProperty('topRoutes');

      // Verify data types
      expect(typeof response.body.totalTransfers).toBe('number');
      expect(typeof response.body.totalRevenue).toBe('number');
      expect(typeof response.body.activeDrivers).toBe('number');
      expect(typeof response.body.completionRate).toBe('number');
      expect(Array.isArray(response.body.transferStatus)).toBe(true);
      expect(Array.isArray(response.body.topClients)).toBe(true);
      expect(Array.isArray(response.body.topDrovers)).toBe(true);
    });

    it('should require admin authentication', async () => {
      await request(app.getHttpServer())
        .get('/admin/reports')
        .expect(401);
    });
  });

  describe('GET /admin/metrics - Business Metrics', () => {
    it('should get business metrics without filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalTransfers');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(typeof response.body.totalTransfers).toBe('number');
      expect(typeof response.body.totalRevenue).toBe('number');
    });

    it('should get business metrics with date filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/metrics?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalTransfers');
      expect(response.body).toHaveProperty('totalRevenue');
    });

    it('should get business metrics with client type filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/metrics?clientType=premium')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalTransfers');
      expect(response.body).toHaveProperty('totalRevenue');
    });

    it('should require admin authentication', async () => {
      await request(app.getHttpServer())
        .get('/admin/metrics')
        .expect(401);
    });
  });

  describe('Admin Access Control', () => {
    it('should verify all admin endpoints require authentication', async () => {
      const endpoints = [
        'GET /admin/users',
        'GET /admin/users/pending',
        'GET /admin/payments/pending',
        'GET /admin/invoices/pending',
        'GET /admin/transfers',
        'GET /admin/reports',
        'GET /admin/metrics'
      ];

      for (const endpoint of endpoints) {
        const [method, path] = endpoint.split(' ');
        await request(app.getHttpServer())
          [method.toLowerCase() as keyof request.SuperTest<request.Test>](path.replace('/admin', '/admin'))
          .expect(401);
      }
    });

    it('should document admin role requirements', () => {
      // This test documents that admin endpoints should require ADMIN role
      // Currently there's no role-based access control implemented
      // This test serves as documentation of the expected behavior
      
      expect(adminUser.role).toBe(UserRole.ADMIN);
      expect(clientUser.role).toBe(UserRole.CLIENT);
      expect(droverUser.role).toBe(UserRole.DROVER);
      
      // In a proper implementation, non-admin users should receive 403 Forbidden
      // when trying to access admin endpoints
    });
  });

  describe('Admin API Design Validation', () => {
    it('should document GET vs POST inconsistencies in user approval endpoints', async () => {
      // These endpoints are designed as GET requests but perform state changes
      // This is an API design inconsistency that should be documented
      
      const approveResponse = await request(app.getHttpServer())
        .get(`/admin/users/${pendingUser.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Should be POST /admin/users/:id/approve instead of GET
      expect(approveResponse.status).toBe(200);
      
      const rejectResponse = await request(app.getHttpServer())
        .get(`/admin/users/${pendingUser.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Should be POST /admin/users/:id/reject instead of GET
      expect(rejectResponse.status).toBe(200);
    });

    it('should test response format consistency across admin endpoints', async () => {
      // Test that admin endpoints return consistent response formats
      const usersResponse = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const paymentsResponse = await request(app.getHttpServer())
        .get('/admin/payments/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const invoicesResponse = await request(app.getHttpServer())
        .get('/admin/invoices/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const transfersResponse = await request(app.getHttpServer())
        .get('/admin/transfers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Users endpoint returns array directly
      expect(Array.isArray(usersResponse.body)).toBe(true);
      
      // Other endpoints return objects with arrays
      expect(typeof paymentsResponse.body).toBe('object');
      expect(Array.isArray(paymentsResponse.body.payments)).toBe(true);
      
      expect(typeof invoicesResponse.body).toBe('object');
      expect(Array.isArray(invoicesResponse.body.invoices)).toBe(true);
      
      expect(typeof transfersResponse.body).toBe('object');
      expect(Array.isArray(transfersResponse.body.transfers)).toBe(true);
      
      // This inconsistency should be documented
    });
  });
});