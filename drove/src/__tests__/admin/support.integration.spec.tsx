import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('Admin Support page (MSW)', () => {
  it('renders support tickets', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_role', 'admin');
    renderWithRouter({ route: '/admin/soporte' });
    await screen.findByText(/Gestión de Soporte/i, undefined, { timeout: 4000 });
    expect(screen.getByText(/Problema con traslado/i)).toBeInTheDocument();
  });
});


