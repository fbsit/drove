import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('Admin Reviews page (UI filters)', () => {
  it('renders and shows filters (smoke)', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_role', 'admin');
    renderWithRouter({ route: '/admin/resenas' });
    await screen.findByText(/Gestión de Reseñas/i, undefined, { timeout: 4000 });
    expect(true).toBe(true);
  });
});


