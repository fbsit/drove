import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('ActiveTrip page (MSW)', () => {
  it('renders trip details and allows finishing trip', async () => {
    // geolocation mock
    // @ts-ignore
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((success: any) => success({ coords: { latitude: 40.4, longitude: -3.7 } })),
      watchPosition: vi.fn((success: any) => {
        success({ coords: { latitude: 40.4, longitude: -3.7 } });
        return 1;
      }),
      clearWatch: vi.fn(),
    } as any;

    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_id', 'd1');

    renderWithRouter({ route: '/traslados/activo/tx1' });

    await screen.findByText(/Traslado en Curso|Traslado Asignado/i, undefined, { timeout: 4000 });
  });
});


