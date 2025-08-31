
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import AppLayout from './components/layout/AppLayout';
import AppRoutes from './router/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
