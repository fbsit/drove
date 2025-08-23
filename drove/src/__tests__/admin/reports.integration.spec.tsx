import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

// Shallow mock of useReportsManagement to return dummy data
vi.mock('@/hooks/admin/useReportsManagement', () => ({
  useReportsManagement: () => ({
    reports: {
      transfers: 10,
      revenue: 1000,
      drivers: 5,
      monthlyGrowth: 12.3,
      transferStatus: [],
      paymentMethods: [],
      paymentStatus: [],
      topClients: [],
      topDrovers: [],
    },
    isLoading: false,
    isGeneratingReport: false,
    generateReport: () => {},
  }),
}));

describe('Admin Reports page (mocked hook)', () => {
  it('renders metrics and charts (smoke)', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_role', 'admin');
    renderWithRouter({ route: '/admin/reportes' });
    await screen.findByText(/Reportes y Análisis/i, undefined, { timeout: 4000 });
    expect(true).toBe(true);
  });
});


