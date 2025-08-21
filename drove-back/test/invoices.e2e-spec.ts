import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User, UserRole, UserStatus } from '../src/user/entities/user.entity';
import { Travels, TransferStatus } from '../src/travels/entities/travel.entity';
import { Invoice, InvoiceStatus, PaymentMethod } from '../src/invoices/entities/invoice.entity';
import { DataSource, Repository } from 'typeorm';

describe('Invoice Management (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let travelsRepository: Repository<Travels>;
  let invoiceRepository: Repository<Invoice>;
  let clientToken: string;
  let adminToken: string;
  let clientUser: User | null;
  let adminUser: User;
  let testTravel: Travels;

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
    invoiceRepository = dataSource.getRepository(Invoice);

    // Create test users
    const bcrypt = require('bcrypt');
    
    // Ensure unique email per run to avoid 409 conflicts across suites
    const uniqueSuffix = Date.now();
    clientUserData.email = `client+${uniqueSuffix}@example.com`;
    adminUserData.email = `admin+${uniqueSuffix}@example.com`;

    // Create client user
    await request(app.getHttpServer())
      .post('/users')
      .send(clientUserData)
      .expect(201);
    
    clientUser = await userRepository.findOne({ where: { email: clientUserData.email }});
    if (!clientUser) throw new Error('Client user not found');
    await userRepository.update(
      { email: clientUserData.email },
      { status: UserStatus.APPROVED, emailVerified: true }
    );

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUserData.password, 10);
    adminUser = userRepository.create({
      ...adminUserData,
      password: hashedPassword,
    });
    await userRepository.save(adminUser);

    // Login users to get tokens
    const clientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: clientUserData.email,
        password: clientUserData.password,
      })
      .expect(201);
    clientToken = clientLogin.body.access_token;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUserData.email,
        password: adminUserData.password,
      })
      .expect(201);
    adminToken = adminLogin.body.access_token;

    // Create a completed test travel for invoice generation
    testTravel = travelsRepository.create({
      idClient: clientUser!.id,
      status: TransferStatus.DELIVERED,
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
      paymentMethod: 'card',
      personDelivery: {
        fullName: 'John Sender',
        dni: '12345678A',
        email: 'sender@example.com',
        phone: '+34123456789'
      },
      personReceive: {
        fullName: 'Jane Receiver',
        dni: '87654321B',
        email: 'receiver@example.com',
        phone: '+34987654321'
      },
      signatureStartClient: 'data:image/png;base64,signature_data',
      pendingViews: {
        client: false,
        driver: false,
        trafficManager: false
      }
    });
    await travelsRepository.save(testTravel);
  });

  beforeEach(async () => {
    // Clean up invoices before each test
    await invoiceRepository.delete({});
  });

  afterAll(async () => {
    // Clean up order respecting FK constraints: delete invoices first, then travels and users
    await invoiceRepository.delete({});
    await travelsRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('POST /invoices - Invoice Creation', () => {
    it('should create an invoice for completed travel', async () => {
      const invoiceData = {
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        dueDate: '2024-02-16',
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
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invoiceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customerId).toBe(clientUser!.id);
      expect(response.body.travelId).toBe(testTravel.id);
      expect(response.body.status).toBe(InvoiceStatus.DRAFT);
      expect(response.body.totalAmount).toBe(450.00);
      expect(response.body.lineItems).toHaveLength(1);
      expect(response.body.lineItems[0].description).toBe('Vehicle Transport Service');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields: customerId, travelId, invoiceDate, etc.
        status: InvoiceStatus.DRAFT,
        currency: 'EUR'
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate line items structure', async () => {
      const invalidData = {
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.DRAFT,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'EUR',
        totalAmount: 450.00,
        lineItems: [
          {
            // Missing required fields: description, quantity, unitPrice
            invalidField: 'should not exist'
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should require authentication', async () => {
      const invoiceData = {
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.DRAFT,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'EUR',
        totalAmount: 450.00,
        lineItems: []
      };

      await request(app.getHttpServer())
        .post('/invoices')
        .send(invoiceData)
        .expect(401);
    });
  });

  describe('GET /invoices - Invoice Listing', () => {
    let testInvoice: Invoice;

    beforeEach(async () => {
      // Create a test invoice
      testInvoice = invoiceRepository.create({
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.SENT,
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

    it('should list all invoices for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(testInvoice.id);
      expect(response.body[0].customerId).toBe(clientUser!.id);
      expect(response.body[0].status).toBe(InvoiceStatus.SENT);
    });

    it('should allow client access to invoice listing', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/invoices')
        .expect(401);
    });
  });

  describe('GET /invoices/:id - Invoice Details', () => {
    let testInvoice: Invoice;

    beforeEach(async () => {
      testInvoice = invoiceRepository.create({
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'EUR',
        totalAmount: 450.00,
        lineItems: [
          {
            description: 'Vehicle Transport Service',
            quantity: 1,
            unitPrice: 450.00
          }
        ],
        payments: [
          {
            method: PaymentMethod.STRIPE,
            stripePaymentId: 'pi_test_12345',
            amount: 450.00,
            paidAt: '2024-01-16T12:00:00Z'
          }
        ]
      });
      await invoiceRepository.save(testInvoice);
    });

    it('should retrieve invoice details by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${testInvoice.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testInvoice.id);
      expect(response.body.customerId).toBe(clientUser!.id);
      expect(response.body.status).toBe(InvoiceStatus.PAID);
      expect(response.body.totalAmount).toBe(450.00);
      expect(response.body.lineItems).toHaveLength(1);
      expect(response.body.payments).toHaveLength(1);
      expect(response.body.payments[0].stripePaymentId).toBe('pi_test_12345');
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toContain('Invoice 99999 not found');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/invoices/${testInvoice.id}`)
        .expect(401);
    });
  });

  describe('PATCH /invoices/:id - Invoice Updates', () => {
    let testInvoice: Invoice;

    beforeEach(async () => {
      testInvoice = invoiceRepository.create({
        customerId: clientUser!.id,
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

    it('should update invoice status', async () => {
      const updateData = {
        status: InvoiceStatus.SENT,
        issuedBy: adminUserData.email,
        issuedAt: new Date().toISOString()
      };

      const response = await request(app.getHttpServer())
        .patch(`/invoices/${testInvoice.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(InvoiceStatus.SENT);
      expect(response.body.issuedBy).toBe(adminUserData.email);
    });

    it('should update line items', async () => {
      const updateData = {
        lineItems: [
          {
            description: 'Vehicle Transport Service',
            quantity: 1,
            unitPrice: 400.00
          },
          {
            description: 'Additional Service Fee',
            quantity: 1,
            unitPrice: 50.00
          }
        ],
        totalAmount: 450.00
      };

      const response = await request(app.getHttpServer())
        .patch(`/invoices/${testInvoice.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.lineItems).toHaveLength(2);
      expect(response.body.lineItems[1].description).toBe('Additional Service Fee');
      expect(response.body.totalAmount).toBe(450.00);
    });

    it('should add payment reference', async () => {
      const updateData = {
        status: InvoiceStatus.PAID,
        payments: [
          {
            method: PaymentMethod.STRIPE,
            stripePaymentId: 'pi_test_payment',
            amount: 450.00,
            paidAt: '2024-01-16T14:30:00Z'
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .patch(`/invoices/${testInvoice.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(InvoiceStatus.PAID);
      expect(response.body.payments).toHaveLength(1);
      expect(response.body.payments[0].stripePaymentId).toBe('pi_test_payment');
    });

    it('should return 404 for non-existent invoice', async () => {
      const updateData = { status: InvoiceStatus.SENT };

      const response = await request(app.getHttpServer())
        .patch('/invoices/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toContain('Invoice 99999 not found');
    });
  });

  describe('DELETE /invoices/:id - Invoice Deletion', () => {
    let testInvoice: Invoice;

    beforeEach(async () => {
      testInvoice = invoiceRepository.create({
        customerId: clientUser!.id,
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

    it('should delete invoice successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/invoices/${testInvoice.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify invoice was deleted
      const deletedInvoice = await invoiceRepository.findOne({
        where: { id: testInvoice.id }
      });
      expect(deletedInvoice).toBeNull();
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app.getHttpServer())
        .delete('/invoices/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toContain('Invoice 99999 not found');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/invoices/${testInvoice.id}`)
        .expect(401);
    });
  });

  describe('Invoice-Travel Integration', () => {
    it('should link invoice to travel correctly', async () => {
      const invoiceData = {
        customerId: clientUser!.id,
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
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invoiceData)
        .expect(201);

      // Verify travel relationship
      const savedInvoice = await invoiceRepository.findOne({
        where: { id: response.body.id },
        relations: ['travel']
      });

      expect(savedInvoice?.travelId).toBe(testTravel.id);
    });

    it('should handle multiple invoices for different travels', async () => {
      // Create second travel
      const secondTravel = travelsRepository.create({
        idClient: clientUser!.id,
        status: TransferStatus.DELIVERED,
        typeVehicle: 'SUV',
        totalPrice: 600.00,
        paymentMethod: 'card',
        travelDate: '2024-01-17',
        travelTime: '15:00'
      });
      await travelsRepository.save(secondTravel);

      // Create invoices for both travels
      const invoice1Data = {
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.SENT,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'EUR',
        totalAmount: 450.00,
        lineItems: [{ description: 'Travel 1', quantity: 1, unitPrice: 450.00 }]
      };

      const invoice2Data = {
        customerId: clientUser!.id,
        travelId: secondTravel.id,
        invoiceDate: '2024-01-17',
        status: InvoiceStatus.SENT,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'EUR',
        totalAmount: 600.00,
        lineItems: [{ description: 'Travel 2', quantity: 1, unitPrice: 600.00 }]
      };

      const response1 = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invoice1Data)
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invoice2Data)
        .expect(201);

      expect(response1.body.travelId).toBe(testTravel.id);
      expect(response2.body.travelId).toBe(secondTravel.id);
      expect(response1.body.totalAmount).toBe(450.00);
      expect(response2.body.totalAmount).toBe(600.00);

      // Clean up
      await travelsRepository.delete(secondTravel.id);
    });
  });

  describe('Invoice Business Logic', () => {
    it('should calculate total from line items correctly', async () => {
      const invoiceData = {
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.DRAFT,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'EUR',
        totalAmount: 525.00, // Should match calculated total
        lineItems: [
          {
            description: 'Base Transport Service',
            quantity: 1,
            unitPrice: 450.00
          },
          {
            description: 'Additional Service Fee',
            quantity: 1,
            unitPrice: 50.00
          },
          {
            description: 'Insurance Coverage',
            quantity: 1,
            unitPrice: 25.00
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invoiceData)
        .expect(201);

      expect(response.body.lineItems).toHaveLength(3);
      expect(response.body.totalAmount).toBe(525.00);
      
      // Verify the line items are saved correctly
      const savedInvoice = await invoiceRepository.findOne({
        where: { id: response.body.id }
      });
      expect(savedInvoice?.lineItems).toHaveLength(3);
    });

    it('should handle different payment methods', async () => {
      const transferInvoiceData = {
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.TRANSFER,
        currency: 'EUR',
        totalAmount: 450.00,
        lineItems: [
          {
            description: 'Vehicle Transport Service',
            quantity: 1,
            unitPrice: 450.00
          }
        ],
        payments: [
          {
            method: PaymentMethod.TRANSFER,
            transferReference: 'BANK_TRANSFER_12345',
            amount: 450.00,
            paidAt: '2024-01-16T10:00:00Z'
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(transferInvoiceData)
        .expect(201);

      expect(response.body.paymentMethod).toBe(PaymentMethod.TRANSFER);
      expect(response.body.payments[0].transferReference).toBe('BANK_TRANSFER_12345');
      expect(response.body.payments[0].method).toBe(PaymentMethod.TRANSFER);
    });

    it('should support different currencies', async () => {
      const usdInvoiceData = {
        customerId: clientUser!.id,
        travelId: testTravel.id,
        invoiceDate: '2024-01-16',
        status: InvoiceStatus.DRAFT,
        paymentMethod: PaymentMethod.STRIPE,
        currency: 'USD',
        totalAmount: 500.00,
        lineItems: [
          {
            description: 'Vehicle Transport Service (USD)',
            quantity: 1,
            unitPrice: 500.00
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(usdInvoiceData)
        .expect(201);

      expect(response.body.currency).toBe('USD');
      expect(response.body.totalAmount).toBe(500.00);
    });
  });

  describe('Invoice Status Workflow', () => {
    it('should document the complete invoice lifecycle', async () => {
      // Step 1: Create draft invoice
      const invoiceData = {
        customerId: clientUser!.id,
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
      };

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invoiceData)
        .expect(201);

      const invoiceId = createResponse.body.id;
      expect(createResponse.body.status).toBe(InvoiceStatus.DRAFT);

      // Step 2: Send invoice to customer
      const sendUpdate = {
        status: InvoiceStatus.SENT,
        issuedBy: adminUserData.email,
        issuedAt: new Date().toISOString()
      };

      const sentResponse = await request(app.getHttpServer())
        .patch(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sendUpdate)
        .expect(200);

      expect(sentResponse.body.status).toBe(InvoiceStatus.SENT);
      expect(sentResponse.body.issuedBy).toBe(adminUserData.email);

      // Step 3: Mark as paid
      const paymentUpdate = {
        status: InvoiceStatus.PAID,
        payments: [
          {
            method: PaymentMethod.STRIPE,
            stripePaymentId: 'pi_workflow_test',
            amount: 450.00,
            paidAt: new Date().toISOString()
          }
        ]
      };

      const paidResponse = await request(app.getHttpServer())
        .patch(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(paymentUpdate)
        .expect(200);

      expect(paidResponse.body.status).toBe(InvoiceStatus.PAID);
      expect(paidResponse.body.payments).toHaveLength(1);

      // Verify final state
      const finalInvoice = await invoiceRepository.findOne({
        where: { id: invoiceId }
      });

      expect(finalInvoice?.status).toBe(InvoiceStatus.PAID);
      expect(finalInvoice?.payments).toHaveLength(1);
    });
  });
});