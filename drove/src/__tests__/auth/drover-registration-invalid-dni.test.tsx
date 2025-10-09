import { describe, it, expect } from 'vitest';

describe('drover registration invalid DNI', () => {
  it('client-side DNI regex should fail for invalid format', () => {
    const bad = '1234567A'; // 7 digits + A
    const good = '12345678Z';
    const re = /^[0-9]{8}[A-Z]$/;
    expect(re.test(bad)).toBe(false);
    expect(re.test(good)).toBe(true);
  });
});


