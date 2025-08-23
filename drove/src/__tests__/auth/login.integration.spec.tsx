import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/test-utils';

describe('Login flow (MSW)', () => {
  it('logs in and redirects to client dashboard', async () => {
    renderWithRouter({ route: '/login' });

    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // After MSW login + fetch user, redirection should happen
    await screen.findByText(/Cliente|Test User/i, undefined, { timeout: 3000 });
  });
});


