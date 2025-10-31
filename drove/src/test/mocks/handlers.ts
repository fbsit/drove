import { http, HttpResponse } from 'msw';

const API = (import.meta as any)?.env?.VITE_API_BASE_URL ||'https://drove-backend-production.up.railway.app';

export const handlers = [
  http.post(`${API}/auth/login`, async () =>
    HttpResponse.json({
      access_token: 'test-token',
      expiresIn: '3600',
      user: { id: 'u1', email: 'a@b.com', role: 'client' },
    }),
  ),

  http.get(`${API}/users/me`, async () => {
    // Permite que los tests fuercen el rol vía localStorage
    const forcedRole = (globalThis as any)?.localStorage?.getItem('auth_user_role');
    const role = (forcedRole || 'client').toLowerCase();
    return HttpResponse.json({
      id: 'u1',
      email: 'a@b.com',
      role,
      user_type: role,
      full_name: 'Test User',
      profile_complete: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    });
  }),

  // travels for client dashboard
  http.get(`${API}/travels/client/:clientId`, async ({ params }) => {
    const { clientId } = params as any;
    const now = new Date().toISOString();
    return HttpResponse.json([
      {
        id: 't1',
        idClient: clientId,
        // fields used by ClientRecentTransferCard
        createdAt: now,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        origin: 'Madrid',
        destination: 'Barcelona',
        brand: 'Toyota',
        model: 'Corolla',
        vin: 'VIN123',
        remitente: 'Alice',
        receptor: 'Bob',
        fechaHora: now,
        distancia: '10km',
        precio: 100,
        totalPrice: 100,
      },
      {
        id: 't2',
        idClient: clientId,
        createdAt: now,
        status: 'IN_PROGRESS',
        paymentStatus: 'PENDING',
        origin: 'Sevilla',
        destination: 'Valencia',
        brand: 'Ford',
        model: 'Focus',
        vin: 'VIN456',
        remitente: 'Carol',
        receptor: 'Dave',
        fechaHora: now,
        distancia: '20km',
        precio: 50,
        totalPrice: 50,
      },
    ]);
  }),

  // admin users list
  http.get(`${API}/admin/users`, async () =>
    HttpResponse.json({
      users: [
        { id: 'u1', full_name: 'Alice', email: 'alice@test.com', company_name: '', phone: '', status: 'active', role: 'CLIENT' },
        { id: 'u2', full_name: 'Bob', email: 'bob@test.com', company_name: '', phone: '', status: 'pending', role: 'DROVER' },
      ],
    }),
  ),

  // clients by role used in Clients page hook
  http.get(`${API}/users/role/client`, async () =>
    HttpResponse.json([
      { id: 'c1', email: 'alice@test.com', full_name: 'Alice', status: 'active', company_name: '', phone: '', contactInfo: { fullName: 'Alice' } },
      { id: 'c2', email: 'bob@test.com', full_name: 'Bob', status: 'pending', company_name: '', phone: '', contactInfo: { fullName: 'Bob' } },
    ]),
  ),

  // admin approve/reject/update client endpoints
  http.put(`${API}/admin/clients/:clientId`, async () => HttpResponse.json({})),
  http.post(`${API}/admin/clients/:clientId/approve`, async () => HttpResponse.json({})),
  http.post(`${API}/admin/clients/:clientId/reject`, async () => HttpResponse.json({})),

  // admin get user by id for profile
  http.get(`${API}/admin/users/:id`, async ({ params }) => {
    const { id } = params as any;
    return HttpResponse.json({
      id,
      status: 'PENDING',
      tipo: 'persona',
      email: 'client@test.com',
      contactInfo: { fullName: 'Cliente Test', phone: '600000000' },
      gamificacion: { traslados: 5 },
      gastoTotal: 100,
      rutasFavoritas: [],
      fecha: new Date().toISOString(),
    });
  }),

  // drover dashboard stats
  http.get(`${API}/users/drover/dashboard`, async () =>
    HttpResponse.json({ assignedTrips: 0, completedTrips: 0, totalEarnings: 0 }),
  ),

  // active trip details
  http.get(`${API}/travels/:id`, async ({ params }) => {
    const { id } = params as any;
    if (id === 'missing') {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    const now = new Date().toISOString();
    return HttpResponse.json({
      id,
      status: 'IN_PROGRESS',
      startAddress: { lat: 40.4168, lng: -3.7038, address: 'Origen Test' },
      endAddress: { lat: 41.3874, lng: 2.1686, address: 'Destino Test' },
      travelDate: now,
      travelTime: '12:00',
      droverId: 'd1',
      droverName: 'Drover Test',
      droverPhone: '123456789',
    });
  }),
  http.patch(`${API}/travels/:id/verification/finishTravel`, async () =>
    HttpResponse.json({ ok: true }),
  ),
  http.patch(`${API}/travels/:id/verification/startTravel`, async () =>
    HttpResponse.json({ ok: true }),
  ),

  // auth recover
  http.post(`${API}/users/forgot-password`, async () => HttpResponse.json({ ok: true })),

  // admin transfers list
  http.get(`${API}/admin/transfers`, async () =>
    HttpResponse.json({
      transfers: [
        {
          id: 'tx-1',
          client: { contactInfo: { fullName: 'Cliente Uno' }, email: 'c1@test.com' },
          drover: { id: 'd1', contactInfo: { fullName: 'Drover Uno' } },
          startAddress: { city: 'Madrid' },
          endAddress: { city: 'Barcelona' },
          status: 'CREATED',
          travelDate: new Date().toISOString(),
          typeVehicle: 'sedan',
          totalPrice: 120,
          brandVehicle: 'Toyota',
          modelVehicle: 'Corolla',
          yearVehicle: '2020',
          licensePlate: 'ABC-123',
          distanceTravel: '10km',
        },
      ],
    }),
  ),
  http.post(`${API}/admin/transfers/:id/assign`, async () => HttpResponse.json({ ok: true })),
  http.put(`${API}/admin/transfers/:id/status`, async () => HttpResponse.json({ ok: true })),

  // invoices list + upload
  http.get(`${API}/invoices`, async () =>
    HttpResponse.json([
      { id: 'inv-1', client_id: 'c1', client_name: 'Cliente Uno', status: 'emitida', issue_date: new Date().toISOString() },
    ]),
  ),
  http.post(`${API}/storage/upload/invoice`, async () => HttpResponse.json({ url: 'https://example.com/test.pdf' })),

  // support tickets
  http.get(`${API}/admin/support/tickets`, async () =>
    HttpResponse.json([
      { id: 't1', subject: 'Problema con traslado', clientName: 'Cliente Uno', clientEmail: 'c1@test.com', status: 'abierto', priority: 'alta', message: 'Detalle...', createdAt: new Date().toISOString() },
    ]),
  ),
  http.put(`${API}/admin/support/tickets/:id/status`, async () => HttpResponse.json({ ok: true })),
  http.post(`${API}/admin/support/tickets/:id/respond`, async () => HttpResponse.json({ ok: true })),
];


