
import React from 'react';
import { MapPin, CheckCircle, Clock, Truck, FileText, Shield } from 'lucide-react';

const CityCard = ({ city, region, isMain = false }: {
  city: string;
  region: string;
  isMain?: boolean;
}) => (
  <div className={`flex items-center gap-3 p-4 rounded-xl ${isMain ? 'bg-drove-accent/20 border border-drove-accent/30' : 'bg-white/5 border border-white/10'}`}>
    <CheckCircle size={20} className={isMain ? "text-drove-accent" : "text-green-400"} />
    <div className="text-left">
      <p className={`font-bold ${isMain ? 'text-drove-accent' : 'text-white'}`}>{city}</p>
      <p className="text-white/60 text-sm">{region}</p>
    </div>
  </div>
);

const ServiceCard = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-drove-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon size={24} className="text-drove-accent" />
      </div>
      <div className="text-left">
        <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
        <p className="text-white/70 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const CoverageSection = () => {
  const mainCities = [
    { city: "Madrid", region: "Comunidad de Madrid" },
    { city: "Barcelona", region: "Cataluña" },
    { city: "Valencia", region: "Comunidad Valenciana" },
    { city: "Sevilla", region: "Andalucía" }
  ];

  const otherCities = [
    { city: "Bilbao", region: "País Vasco" },
    { city: "Málaga", region: "Andalucía" },
    { city: "Zaragoza", region: "Aragón" },
    { city: "Murcia", region: "Región de Murcia" },
    { city: "Palma", region: "Islas Baleares" },
    { city: "Valladolid", region: "Castilla y León" },
    { city: "Vigo", region: "Galicia" },
    { city: "Alicante", region: "Comunidad Valenciana" }
  ];

  const services = [
    {
      icon: Truck,
      title: "Desplazamientos",
      description: "Transporte de automóviles a cualquier destino dentro del territorio nacional (excepto Islas Canarias) y gran parte de Europa e Inglaterra."
    },
    {
      icon: MapPin,
      title: "Traslados",
      description: "Servicio de traslado de automóviles a diferentes puntos del territorio nacional y europeo, asegurando puntualidad y cuidado en cada viaje."
    },
    {
      icon: Shield,
      title: "Peritaje",
      description: "Evaluación y revisión detallada de automóviles por expertos cualificados."
    },
    {
      icon: FileText,
      title: "Envío de Documentación",
      description: "Gestión segura y eficiente del envío de documentos importantes relacionados con el transporte de su vehículo."
    }
  ];

  return (
    <section className="px-4 py-16 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Cobertura nacional y europea
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Operamos principalmente en España y Europa, conectando las principales ciudades con nuestra red de drovers profesionales
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Mapa mejorado con arte DROVE */}
          <div className="relative">
            <div className="bg-gradient-to-br from-drove-accent/20 to-drove-accent/5 rounded-2xl p-8 border border-drove-accent/20 aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-6">
                  {/* Simulación de mapa con arte DROVE */}
                  <div className="w-32 h-32 mx-auto relative">
                    <div className="absolute inset-0 bg-drove-accent/30 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-drove-accent/50 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute inset-8 bg-drove-accent rounded-full flex items-center justify-center">
                      <MapPin size={32} className="text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Red Nacional y Europea</h3>
                <p className="text-white/70 mb-4">Transporte profesional de vehículos</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-drove-accent font-bold block">50+</span>
                    <p className="text-white/70">Ciudades</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-drove-accent font-bold block">16</span>
                    <p className="text-white/70">Comunidades</p>
                  </div>
                </div>
                <div className="mt-4 bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Clock size={16} className="text-drove-accent" />
                    <span className="text-white font-semibold">Horario de Servicio</span>
                  </div>
                  <p className="text-white/70 text-sm">L-V: 8:00-15:00 y 16:00-19:00</p>
                  <p className="text-white/70 text-sm">S y D: Cerrado</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lista de ciudades */}
          <div>
            <h3 className="text-xl font-bold text-drove-accent mb-6 text-left">Principales ciudades</h3>
            <div className="grid gap-3 mb-8">
              {mainCities.map((city, index) => (
                <CityCard key={index} {...city} isMain />
              ))}
            </div>
            
            <h4 className="text-lg font-bold text-white mb-4 text-left">Y muchas más...</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherCities.map((city, index) => (
                <CityCard key={index} {...city} />
              ))}
            </div>
          </div>
        </div>

        {/* Servicios */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Nuestros Servicios</h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              Ofrecemos una gama completa de servicios especializados en el transporte y manejo de vehículos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;
