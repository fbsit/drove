
import React from 'react';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import TeamExperienceSection from '@/components/about/TeamExperienceSection';
import TeamMembersSection from '@/components/about/TeamMembersSection';
import ContactCTASection from '@/components/about/ContactCTASection';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-drove">
      <AboutHeroSection />
      <TeamExperienceSection />
      <TeamMembersSection />
      <ContactCTASection />
    </div>
  );
};

export default AboutPage;
