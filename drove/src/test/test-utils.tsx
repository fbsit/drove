import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/providers/AppProviders';
import AppRoutes from '@/router/AppRoutes';

type RenderOptions = {
  route?: string;
  routes?: string[];
};

export function renderWithProviders(ui: React.ReactElement, options: RenderOptions = {}) {
  const { route = '/', routes = [route] } = options;
  return render(
    <MemoryRouter initialEntries={routes} initialIndex={0}>
      <AppProviders>{ui}</AppProviders>
    </MemoryRouter>
  );
}

export function renderWithRouter(options: RenderOptions = {}) {
  const { route = '/', routes = [route] } = options;
  return render(
    <MemoryRouter initialEntries={routes} initialIndex={0}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </MemoryRouter>
  );
}


