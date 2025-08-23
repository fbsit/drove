import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from './mocks/server';
import '@testing-library/jest-dom/vitest';
import 'whatwg-fetch';

const USE_MSW = (import.meta as any).env?.VITE_USE_MSW ?? 'true';

if (USE_MSW !== 'false') {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

// When USE_MSW=false, we skip starting the server to allow real backend usage.

// jsdom lacks matchMedia; provide a minimal mock for hooks/components using it
if (typeof window !== 'undefined' && !window.matchMedia) {
  // @ts-ignore
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Polyfill ResizeObserver for components like Recharts in jsdom
if (typeof window !== 'undefined' && !(window as any).ResizeObserver) {
  class ResizeObserverPolyfill {
    callback: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.callback = cb;
    }
    observe() { /* no-op */ }
    unobserve() { /* no-op */ }
    disconnect() { /* no-op */ }
  }
  // @ts-ignore
  (window as any).ResizeObserver = ResizeObserverPolyfill;
}


