import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/test-utils';

describe('ForgotPassword page (MSW)', () => {
  it('submits email and shows confirmation', async () => {
    renderWithRouter({ route: '/recuperar-contraseña' });
    await screen.findByText(/Recuperar Contraseña/i);

    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar email de recuperación/i }));

    await screen.findByRole('heading', { name: /Email Enviado/i });
    expect(screen.getByText(/user@test.com/i)).toBeInTheDocument();
  });
});


