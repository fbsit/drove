
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Importaciones de páginas públicas
import Index from '@/pages/Index';
import AboutPage from '@/pages/AboutPage';
import ComoFunciona from '@/pages/ComoFunciona';
import Seguridad from '@/pages/Seguridad';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import Register from '@/pages/auth/Register';
import Apply from '@/pages/driver/Apply';
import QRRedirect from '@/pages/qr/QRRedirect';
import TermsOfService from '@/pages/auth/TermsOfService';
import PrivacyPolicy from '@/pages/auth/PrivacyPolicy';
import CookiesPolicy from '@/pages/auth/CookiesPolicy';
import SoportePage from '@/pages/soporte/Soporte';
import TransferViewer from '@/pages/trips/TransferViewer';
import PaymentSuccess from '@/pages/paymentSuccess';
import PaymentCancel from '@/pages/paymentCancel';
import NotFound from '@/pages/NotFound';

// Importaciones de páginas protegidas
import ProfileRedirect from '@/pages/ProfileRedirect';
import AdminProfile from '@/pages/admin/Profile';
import ClientProfilePage from '@/pages/client/Profile';
import DroverProfileComplete from '@/pages/drover/Profile';
import ClientProfile from '@/pages/admin/ClientProfile';
import DroverTraslados from '@/pages/drover/Traslados';
import DroverHistory from '@/pages/drover/History';
// Dashboards
import DashboardAdminPanel from '@/pages/dashboard/DashboardAdminPanel';
import DashboardClientPanel from '@/pages/client/Dashboard';
import DashboardDroverPanel from '@/pages/dashboard/DashboardDroverPanel';
import DashboardTrafficPanel from '@/pages/dashboard/DashboardTrafficPanel';

// Páginas de cliente
import TransferRequest from '@/pages/vehicle-transfer/TransferRequest';
import ClientTransfersPage from '@/pages/client/Transfers';
import ClientTripDetail from '@/pages/client/ClientTripDetail';

// Páginas de drover
import ActiveTrip from '@/pages/trips/ActiveTrip';
import PickupVerification from '@/pages/vehicle-pickup/PickupVerification';
import DeliveryVerification from '@/pages/vehicle-delivery/DeliveryVerification';
import ResenasDrover from '@/pages/drover/Resenas';

// Páginas comunes
import TransferDetail from '@/pages/trips/TransferDetail';
import TripDetail from '@/pages/trips/TripDetail';

// Páginas de admin
import Transfers from '@/pages/admin/Transfers';
import Drovers from '@/pages/admin/Drovers';
import Clients from '@/pages/admin/Clients';
import Reports from '@/pages/admin/Reports';
import Invoices from '@/pages/admin/Invoices';
import Reviews from '@/pages/admin/Reviews';
import Support from '@/pages/admin/Support';
import Payments from '@/pages/admin/Payments';
import AssignDriver from '@/pages/admin/AssignDriver';
import ReassignDriver from '@/pages/admin/ReassignDriver';
import JefesDeTrafico from '@/pages/admin/JefesDeTrafico';
import DroverProfile from '@/pages/admin/DroverProfile';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import PendingApproval from '@/pages/auth/PendingApproval';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/sobre-nosotros" element={<AboutPage />} />
      <Route path="/como-funciona" element={<ComoFunciona />} />
      <Route path="/seguridad" element={<Seguridad />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verifyEmail" element={<VerifyEmail />} />
      <Route path="/registro/en-revision" element={<PendingApproval />} />
      <Route path="/recuperar-contraseña" element={<ForgotPassword />} />
      <Route path="/reset-password/:code" element={<ResetPassword />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/registro/:userType" element={<Register />} />
      <Route path="/postular" element={<Apply />} />
      <Route path="/qr/:code" element={<QRRedirect />} />
      <Route path="/terminos" element={<TermsOfService />} />
      <Route path="/privacidad" element={<PrivacyPolicy />} />
      <Route path="/cookies" element={<CookiesPolicy />} />
      <Route path="/soporte" element={<SoportePage />} />
      <Route path="/ver-traslado/:id" element={<TransferViewer />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        {/* Ruta universal de perfil */}
        <Route path="/perfil" element={<ProfileRedirect />} />

        {/* Rutas de perfil por rol */}
        <Route path="/admin/perfil" element={<AdminProfile />} />
        <Route path="/cliente/perfil" element={<ClientProfilePage />} />
        <Route path="/trafico/perfil" element={<AdminProfile />} />
        <Route path="/drover/perfil" element={<DroverProfileComplete />} />
        <Route path="/admin/clientes/:id" element={<ClientProfile />} />

        {/* Rutas de dashboard */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<DashboardAdminPanel />} />
        <Route path="/cliente/dashboard" element={<DashboardClientPanel />} />
        <Route path="/drover/dashboard" element={<DashboardDroverPanel />} />
        <Route path="/trafico/dashboard" element={<DashboardTrafficPanel />} />

        {/* Rutas de cliente */}
        <Route path="/solicitar-traslado" element={<TransferRequest />} />
        <Route path="/cliente/traslados" element={<ClientTransfersPage />} />
        <Route path="/cliente/traslados/:id" element={<ClientTripDetail />} />

        {/* Rutas de drover */}
        <Route path="/traslados/activo/:transferId" element={<ActiveTrip />} />
        <Route path="/verificacion/recogida/:transferId" element={<PickupVerification />} />
        <Route path="/verificacion/entrega/:transferId" element={<DeliveryVerification />} />
        <Route path="/drover/resenas" element={<ResenasDrover />} />
        <Route path="/drover/viajes-disponibles" element={<DroverTraslados />} />
        <Route path="/drover/historial" element={<DroverHistory />} />
        {/* Rutas de verificación de perfil */}

        {/* Rutas comunes */}
        <Route path="/traslados/:id" element={<TransferDetail />} />
        <Route path="/viajes/:id" element={<TripDetail />} />

        {/* Rutas de admin */}
        <Route path="/admin/traslados" element={<Transfers />} />
        <Route path="/admin/drovers" element={<Drovers />} />
        <Route path="/admin/clientes" element={<Clients />} />
        <Route path="/admin/reportes" element={<Reports />} />
        <Route path="/admin/facturas" element={<Invoices />} />
        <Route path="/admin/resenas" element={<Reviews />} />
        <Route path="/admin/soporte" element={<Support />} />
        <Route path="/admin/pagos" element={<Payments />} />
        <Route path="/admin/asignar/:transferId" element={<AssignDriver />} />
        <Route path="/admin/reasignar/:transferId" element={<ReassignDriver />} />
        <Route path="/admin/jefes-trafico" element={<JefesDeTrafico />} />
        <Route path="/admin/drovers/:id" element={<DroverProfile />} />
      </Route>

      {/* Rutas de pago */}
      <Route path="/paymentSuccess" element={<PaymentSuccess />} />
      <Route path="/paymentFailed" element={<PaymentCancel />} />
      <Route path="/paymentCancel" element={<PaymentCancel />} />
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
