import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';
import { installGoogleMapsMock } from '@/test/mocks/google-maps';

describe('Maps with Google mock', () => {
  it('renders trip map with mocked Google APIs', async () => {
    installGoogleMapsMock();
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_id', 'd1');

    renderWithRouter({ route: '/traslados/activo/tx1' });

    await screen.findByText(/Detalles del Traslado/i, undefined, { timeout: 4000 });
    expect(true).toBe(true);
  });
});


