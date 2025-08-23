import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('Client Transfers page (MSW)', () => {
  it('renders transfers list and filters without crashing', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_id', 'u1');

    renderWithRouter({ route: '/cliente/traslados' });

    await screen.findByText(/Mis Traslados/i, undefined, { timeout: 4000 });
  });
});


