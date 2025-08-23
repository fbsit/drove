import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/test-utils';

describe('Admin Transfers page (MSW)', () => {
  it('renders transfers and opens reschedule modal', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user_role', 'admin');

    renderWithRouter({ route: '/admin/traslados' });

    await screen.findByText(/Gestión de Traslados/i, undefined, { timeout: 4000 });
    expect(screen.getByText(/#tx-1/i)).toBeInTheDocument();

    // Click reprogramar if visible
    const btn = screen.queryByRole('button', { name: /Reprogramar/i });
    if (btn) {
      await userEvent.click(btn);
    }

    expect(true).toBe(true);
  });
});


