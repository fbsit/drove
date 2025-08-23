
/**
 * Prueba para verificar la correcta redirección según el rol del usuario
 */

import { describe, expect, test } from 'vitest';
import { getRedirectPathForUser } from '@/utils/authRedirects';
import type { User } from '@/types/auth';

describe('User Redirection Tests', () => {
  
  test('Debe redirigir a /login cuando no hay usuario', () => {
    expect(getRedirectPathForUser(null)).toBe('/login');
  });
  
  test('Debe redirigir correctamente a un usuario con user_type drover', () => {
    const user: User = {
      id: '123',
      email: 'drover@example.com',
      user_type: 'drover',
      full_name: 'Test Drover',
      role: 'DROVER',
      profile_complete: true,
      is_approved: true
    };
    
    expect(getRedirectPathForUser(user as any)).toBe('/drover/dashboard');
  });
  
  test('Debe redirigir correctamente a un usuario con role=DROVER', () => {
    const user: User = {
      id: '123',
      email: 'drover@example.com',
      user_type: 'client', // user_type incorrecto pero role correcto
      full_name: 'Test Drover',
      role: 'DROVER',
      profile_complete: true,
      is_approved: true
    };
    
    expect(getRedirectPathForUser(user as any)).toBe('/drover/dashboard');
  });
  
  test('Debe redirigir correctamente a un usuario con user_type client', () => {
    const user: User = {
      id: '123',
      email: 'client@example.com',
      user_type: 'client',
      full_name: 'Test Client',
      role: 'CLIENT',
      profile_complete: true,
      is_approved: true
    };
    
    expect(getRedirectPathForUser(user as any)).toBe('/cliente/dashboard');
  });
  
  test('Debe redirigir correctamente a un usuario con role=ADMIN', () => {
    const user: User = {
      id: '123',
      email: 'admin@example.com',
      user_type: 'admin',
      full_name: 'Test Admin',
      role: 'ADMIN',
      profile_complete: true,
      is_approved: true
    };
    
    expect(getRedirectPathForUser(user as any)).toBe('/admin/dashboard');
  });
});
