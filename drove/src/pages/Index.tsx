import React, { Suspense } from "react";
import { layoutConfig } from "@/data/home-sections";
import { useHomeLayout } from "@/hooks/useHomeLayout";
import EnhancedFooter from "@/components/home/EnhancedFooter";

const Index = () => {
  const { renderSection, prioritySections } = useHomeLayout();

  return (
    <div className={layoutConfig.containerClasses}>
      {/* Main content */}
      <main className="flex-1">
        {/* Secciones de alta prioridad - Sin lazy loading */}
        {prioritySections.high.map((section) => (
          <React.Fragment key={section.id}>
            {renderSection(section)}
          </React.Fragment>
        ))}

        {/* Secciones de media y baja prioridad - Con lazy loading */}
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-white/60">Cargando...</div>
            </div>
          }
        >
          {prioritySections.medium.map((section) => (
            <React.Fragment key={section.id}>
              {renderSection(section)}
            </React.Fragment>
          ))}
          {prioritySections.low.map((section) => (
            <React.Fragment key={section.id}>
              {renderSection(section)}
            </React.Fragment>
          ))}
        </Suspense>
      </main>

      {/* Footer siempre al final */}
      <EnhancedFooter />
    </div>
  );
};

export default Index;
