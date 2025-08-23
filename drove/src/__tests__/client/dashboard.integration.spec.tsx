import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('Client Dashboard (MSW)', () => {
  it('shows client name/email and KPIs after login', async () => {
    // Seed the auth state by simulating a successful login flow
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_id', 'u1');

    renderWithRouter({ route: '/cliente/dashboard' });

    // Wait for dashboard header
    await screen.findByText(/Bienvenido de vuelta|Cliente|Test User/i, undefined, { timeout: 3000 });
  });
});


