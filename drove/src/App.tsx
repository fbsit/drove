
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import AppLayout from './components/layout/AppLayout';
import AppRoutes from './router/AppRoutes';
import './App.css';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
