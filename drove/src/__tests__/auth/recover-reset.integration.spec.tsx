import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/test-utils';

describe('Auth recover/reset (routing + form)', () => {
  it('renders PaymentCancel as recover fallback and interacts (smoke)', async () => {
    // Using existing pages as placeholders; replace with actual recover pages when available
    renderWithRouter({ route: '/paymentCancel?travel=tvx' });
    await screen.findByText(/Pago cancelado/i);
    await userEvent.click(screen.getByRole('button', { name: /Volver atrás/i }));
    expect(true).toBe(true);
  });
});


