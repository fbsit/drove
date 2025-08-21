
import React from 'react';
import SecurityHeroSection from '@/components/seguridad/SecurityHeroSection';
import SecurityFeaturesSection from '@/components/seguridad/SecurityFeaturesSection';
import CertificationsSection from '@/components/seguridad/CertificationsSection';
import EmergencyProtocolSection from '@/components/seguridad/EmergencyProtocolSection';
import TrustSection from '@/components/seguridad/TrustSection';

const Seguridad = () => {
  return (
    <div className="min-h-screen bg-drove">
      <SecurityHeroSection />
      <SecurityFeaturesSection />
      <CertificationsSection />
      <EmergencyProtocolSection />
      <TrustSection />
    </div>
  );
};

export default Seguridad;
