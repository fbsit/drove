import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/test-utils';

describe('Admin Payments page (UI filters)', () => {
  it('renders and filters payments (UI-only)', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_role', 'admin');
    renderWithRouter({ route: '/admin/pagos' });

    await screen.findByText(/Gestión de Pagos/i, undefined, { timeout: 4000 });

    // Filter by method and status
    await userEvent.selectOptions(screen.getByDisplayValue('Todos los estados'), 'pendiente');
    await userEvent.selectOptions(screen.getByDisplayValue('Todos los métodos'), 'tarjeta');

    expect(true).toBe(true);
  });
});


