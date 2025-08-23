import { describe, it, expect } from 'vitest';
import { AuthService } from '@/services/authService';
import { getRedirectPathForUser } from '@/utils/authRedirects';

describe('login + redirect', () => {
  it('returns token and redirects client to /cliente/dashboard', async () => {
    const res = await AuthService.signIn({ email: 'a@b.com', password: 'x' } as any);
    expect(res.access_token).toBeTruthy();

    const me = await AuthService.getCurrentUser();
    const path = getRedirectPathForUser({ ...(me as any), role: 'client' } as any);
    expect(path).toBe('/cliente/dashboard');
  });
});


