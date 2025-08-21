
import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialCard = ({ name, role, company, rating, comment, avatar }: {
  name: string;
  role: string;
  company?: string;
  rating: number;
  comment: string;
  avatar: string;
}) => (
  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 relative">
    <Quote className="absolute top-4 right-4 text-drove-accent/30" size={24} />
    
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          className={i < rating ? "text-yellow-400 fill-current" : "text-gray-400"} 
        />
      ))}
    </div>
    
    <p className="text-white/80 mb-6 italic">"{comment}"</p>
    
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-drove-accent/20 rounded-full flex items-center justify-center">
        <span className="text-drove-accent font-bold">{avatar}</span>
      </div>
      <div>
        <p className="font-bold text-white">{name}</p>
        <p className="text-white/60 text-sm">{role}{company && `, ${company}`}</p>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "María González",
      role: "Directora Comercial",
      company: "AutoVenta Madrid",
      rating: 5,
      comment: "Excelente servicio. Transportaron 15 vehículos de nuestra flota sin ningún problema. Muy profesionales y puntuales.",
      avatar: "MG"
    },
    {
      name: "Carlos Ruiz",
      role: "Drover",
      rating: 5,
      comment: "Llevo 8 meses trabajando con DROVE. La plataforma es muy fácil de usar y siempre hay trabajo disponible. Muy recomendable.",
      avatar: "CR"
    },
    {
      name: "Ana Martín",
      role: "Cliente particular",
      rating: 5,
      comment: "Necesitaba trasladar mi coche de Barcelona a Sevilla. El servicio fue impecable, con seguimiento en tiempo real. Volveré a usarlo.",
      avatar: "AM"
    },
    {
      name: "David López",
      role: "Gerente",
      company: "Concesionario Valencia",
      rating: 5,
      comment: "Perfecta coordinación y comunicación. Los drovers son muy profesionales y cuidan cada detalle del transporte.",
      avatar: "DL"
    }
  ];

  return (
    <section className="px-4 py-16 md:py-20 bg-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            La confianza y satisfacción de nuestros usuarios es nuestra mejor carta de presentación
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
