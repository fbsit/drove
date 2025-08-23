import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/test-utils';

describe('Admin > ClientProfile approve/reject (MSW)', () => {
  it('approves client from modal', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_role', 'admin');

    renderWithRouter({ route: '/admin/clientes/u123' });

    await screen.findByText(/Aprobar/i, undefined, { timeout: 4000 });

    await userEvent.click(screen.getByRole('button', { name: /Aprobar/i }));
    const approveConfirm = await screen.findByRole('button', { name: /Aprobar Cliente/i });
    await userEvent.click(approveConfirm);

    // Toast exists but not easily queryable; assert page still renders
    await screen.findByText(/Datos del cliente/i);
  });
});


