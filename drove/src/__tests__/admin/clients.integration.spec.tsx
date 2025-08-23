import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('Admin > Clients page (MSW)', () => {
  it('renders clients grid with mocked users', async () => {
    // seed auth as admin
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_id', 'admin1');
    localStorage.setItem('auth_user_role', 'admin');

    renderWithRouter({ route: '/admin/clientes' });

    // heading
    await screen.findByText(/Gestión de Clientes/i, undefined, { timeout: 4000 });

    // grid content from MSW handler (UI shows names, not emails)
    await screen.findByText(/Alice/i, undefined, { timeout: 4000 });
    await screen.findByText(/Bob/i, undefined, { timeout: 4000 });
  });
});


