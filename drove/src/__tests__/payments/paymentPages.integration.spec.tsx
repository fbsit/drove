import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/test-utils';

describe('Payments pages', () => {
  it('renders PaymentSuccess with travel id and logo', async () => {
    renderWithRouter({ route: '/paymentSuccess?travel=tv123' });
    await screen.findByText(/Pago completado/i);
    expect(screen.getByText(/tv123/i)).toBeInTheDocument();
  });

  it('renders PaymentCancel with travel id and back button', async () => {
    renderWithRouter({ route: '/paymentCancel?travel=tv456' });
    await screen.findByText(/Pago cancelado/i);
    expect(screen.getByText(/tv456/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver atrás/i })).toBeInTheDocument();
  });
});


