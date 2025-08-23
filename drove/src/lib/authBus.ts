export function dispatchUnauthorized(): void {
  try {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  } catch (_) {
    // ignore when window is not available (SSR/tests)
  }
}


