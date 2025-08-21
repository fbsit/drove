import React, {
  lazy,
  useMemo,
  type LazyExoticComponent,
  type ComponentType,
} from 'react';
import { homeSections, type HomeSection } from '@/data/home-sections';

const StatsSection = lazy(() => import('@/components/home/StatsSection'));
const ProcessSection = lazy(() => import('@/components/home/ProcessSection'));
const TechnologySection = lazy(() => import('@/components/home/TechnologySection'));
const ClientBenefits = lazy(() => import('@/components/home/ClientBenefits'));
const DriverBenefits = lazy(() => import('@/components/home/DriverBenefits'));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'));
const CoverageSection = lazy(() => import('@/components/home/CoverageSection'));
const SecuritySection = lazy(() => import('@/components/home/SecuritySection'));
const FAQSection = lazy(() => import('@/components/home/FAQSection'));

export const useHomeLayout = () => {
  const lazyComponents = useMemo(() => {
    const componentMap: Record<
      string,
      LazyExoticComponent<ComponentType<any>>
    > = {
      stats: StatsSection,
      process: ProcessSection,
      technology: TechnologySection,
      'client-benefits': ClientBenefits,
      'driver-benefits': DriverBenefits,
      testimonials: TestimonialsSection,
      coverage: CoverageSection,
      security: SecuritySection,
      faq: FAQSection,
    };

    return componentMap;
  }, []);

  const renderSection = (section: HomeSection): JSX.Element | null => {
    const Component = section.lazy
      ? lazyComponents[section.id]
      : section.component;

    if (!Component) return null;

    return <Component />;
  };

  const prioritySections = useMemo(() => {
    const highPriority = homeSections.filter((s) => s.priority === 'high');
    const mediumPriority = homeSections.filter((s) => s.priority === 'medium');
    const lowPriority = homeSections.filter((s) => s.priority === 'low');

    return {
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority,
    };
  }, []);

  return {
    renderSection,
    prioritySections,
    lazyComponents,
  };
};
