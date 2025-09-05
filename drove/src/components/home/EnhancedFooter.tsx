
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import DroveLogo from '@/components/DroveLogo';

const FooterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="md:mb-0 w-full xl:w-fit max-w-[250px] ">
    <h3 className="font-bold text-white mb-4">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const FooterLink = ({ to, children, external = false }: {
  to: string;
  children: React.ReactNode;
  external?: boolean;
}) => (
  external ? (
    <a
      href={to}
      className="text-white/70 hover:text-drove-accent transition-colors block"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ) : (
    <Link
      to={to}
      className="text-white/70 hover:text-drove-accent transition-colors block"
    >
      {children}
    </Link>
  )
);

const EnhancedFooter = () => {
  return (
    <footer className="bg-drove/95 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex gap-8 justify-center xl:justify-between flex-wrap lg:flex-nowrap">
          {/* Logo y descripción */}
          <div className="md:col-span-2 lg:col-span-1">
            <h4 className="text-white font-semibold mb-2">Sobre Nosotros</h4>
            <p className="text-white/70 mb-4 text-sm w-[250px]">
              Plataforma digital innovadora que conecta clientes con drovers profesionales para el transporte seguro de vehículos. Tecnología avanzada, seguimiento en tiempo real y máxima confianza.
            </p>
          </div>

          {/* Servicios */}
          <FooterSection title="Servicios">
            <FooterLink to="/registro">Solicitar transporte</FooterLink>
            <FooterLink to="/postular">Ser drover</FooterLink>
            <FooterLink to="/login">Acceder a mi cuenta</FooterLink>
            <FooterLink to="/soporte">Soporte técnico</FooterLink>
          </FooterSection>

          {/* Empresa */}
          <FooterSection title="Empresa">
            <FooterLink to="/sobre-nosotros">Sobre DROVE</FooterLink>
            <FooterLink to="/como-funciona">Cómo funciona</FooterLink>
            <FooterLink to="/seguridad">Seguridad</FooterLink>
          </FooterSection>

          {/* Contacto */}
          <FooterSection title="Contacto">
            <span className="text-white/70 hover:text-drove-accent transition-colors block">+34 611 59 14 29</span>
            <span className="text-white/70 hover:text-drove-accent transition-colors block">transportes@droveland.es</span>
            <span className="text-white/70 hover:text-drove-accent transition-colors block">Calle Eras, 54. 3D. Alcantarilla, Murcia. 30820</span>
            <div className="flex gap-3 justify-center">
              <a
                href="https://www.instagram.com/droveland_international_"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-drove-accent/20 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={16} className="text-white/70 hover:text-drove-accent" />
              </a>
            </div>
          </FooterSection>
        </div>

        <DroveLogo size="lg" className="mb-4" />


        {/* Línea separadora */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/40 text-sm">
              © {new Date().getFullYear()} DROVE. Todos los derechos reservados.
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm justify-center md:justify-end">
              <FooterLink to="/privacidad">Política de Privacidad</FooterLink>
              <FooterLink to="/terminos">Términos de Uso</FooterLink>
              <FooterLink to="/cookies">Cookies</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
