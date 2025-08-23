import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('Admin Invoices page (MSW)', () => {
  it('renders invoice list', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_role', 'admin');
    renderWithRouter({ route: '/admin/facturas' });
    await screen.findByText(/Gestión de Facturas/i, undefined, { timeout: 4000 });
    await screen.findByText(/inv-1/i, undefined, { timeout: 4000 });
  });
});


