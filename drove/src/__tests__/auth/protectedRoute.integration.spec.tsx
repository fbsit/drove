import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('ProtectedRoute redirect', () => {
  it('redirects to /login when not authenticated', async () => {
    localStorage.removeItem('auth_token');
    renderWithRouter({ route: '/cliente/dashboard' });
    await screen.findByRole('heading', { name: /iniciar sesión/i });
  });
});


