import HeroSection from "@/components/home/HeroSection";
import PromoBanner from "@/components/home/PromoBanner";
import StatsSection from "@/components/home/StatsSection";
import ProcessSection from "@/components/home/ProcessSection";
import TechnologySection from "@/components/home/TechnologySection";
import ClientBenefits from "@/components/home/ClientBenefits";
import DriverBenefits from "@/components/home/DriverBenefits";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CoverageSection from "@/components/home/CoverageSection";
import SecuritySection from "@/components/home/SecuritySection";
import FAQSection from "@/components/home/FAQSection";

export interface HomeSection {
  id: string;
  component: React.ComponentType;
  componentName: string; // Nuevo campo para mapeo exacto de archivos
  priority: "high" | "medium" | "low";
  lazy?: boolean;
}

export const homeSections: HomeSection[] = [
  {
    id: "hero",
    component: HeroSection,
    componentName: "HeroSection",
    priority: "high",
    lazy: false,
  },
  {
    id: "promo",
    component: PromoBanner,
    componentName: "PromoBanner",
    priority: "high",
    lazy: false,
  },
  {
    id: "stats",
    component: StatsSection,
    componentName: "StatsSection",
    priority: "medium",
    lazy: true,
  },
  {
    id: "process",
    component: ProcessSection,
    componentName: "ProcessSection",
    priority: "medium",
    lazy: true,
  },
  {
    id: "technology",
    component: TechnologySection,
    componentName: "TechnologySection",
    priority: "medium",
    lazy: true,
  },
  {
    id: "client-benefits",
    component: ClientBenefits,
    componentName: "ClientBenefits",
    priority: "low",
    lazy: true,
  },
  {
    id: "driver-benefits",
    component: DriverBenefits,
    componentName: "DriverBenefits",
    priority: "low",
    lazy: true,
  },
  {
    id: "testimonials",
    component: TestimonialsSection,
    componentName: "TestimonialsSection",
    priority: "low",
    lazy: true,
  },
  {
    id: "coverage",
    component: CoverageSection,
    componentName: "CoverageSection",
    priority: "low",
    lazy: true,
  },
  {
    id: "security",
    component: SecuritySection,
    componentName: "SecuritySection",
    priority: "low",
    lazy: true,
  },
  {
    id: "faq",
    component: FAQSection,
    componentName: "FAQSection",
    priority: "low",
    lazy: true,
  },
];

export const layoutConfig = {
  headerOffset: 32, // mt-32 equivalent
  containerClasses: "min-h-screen flex flex-col bg-drove",
};
