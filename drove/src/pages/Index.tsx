
import React, { Suspense } from 'react';
import { layoutConfig } from '@/data/home-sections';
import { useHomeLayout } from '@/hooks/useHomeLayout';

const Index = () => {
  const { renderSection, prioritySections } = useHomeLayout();

  console.log("estamos aca")

  return (
    <div className={layoutConfig.containerClasses}>
      <div style={{ marginTop: `${layoutConfig.headerOffset}px` }}>
        {/* Secciones de alta prioridad - Sin lazy loading */}
        {prioritySections.high.map((section) => (
          <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
        ))}
        
        {/* Secciones de media y baja prioridad - Con lazy loading */}
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-white/60">Cargando2...</div>
          </div>
        }>
          {prioritySections.medium.map((section) => (
            <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
          ))}
          {prioritySections.low.map((section) => (
            <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
          ))}
        </Suspense>
      </div>
    </div>
  );
};

export default Index;
