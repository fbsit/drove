
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "¿Cómo funciona el servicio de DROVE?",
      answer: "DROVE conecta a clientes que necesitan transportar vehículos con drovers profesionales verificados. Simplemente solicitas el traslado, nosotros asignamos un drover, y puedes seguir tu vehículo en tiempo real hasta la entrega."
    },
    {
      question: "¿Qué tipos de vehículos transportan?",
      answer: "Transportamos todo tipo de vehículos: coches, motos, furgonetas, autocaravanas y vehículos comerciales. Nuestros drovers están capacitados para manejar diferentes tipos de vehículos de forma segura."
    },
    {
      question: "¿Cómo se verifica a los drovers?",
      answer: "Todos nuestros drovers pasan por un riguroso proceso de verificación que incluye: validación de licencia de conducir, antecedentes penales, experiencia de conducción, seguro y formación en nuestra plataforma."
    },
    {
      question: "¿Puedo seguir mi vehículo durante el transporte?",
      answer: "Sí, ofrecemos seguimiento GPS en tiempo real. Recibirás actualizaciones constantes de la ubicación de tu vehículo y podrás comunicarte directamente con el drover asignado."
    },
    {
      question: "¿Qué pasa si hay algún problema durante el transporte?",
      answer: "Contamos con soporte 24/7 y seguro completo. En caso de cualquier incidencia, nuestro equipo actúa inmediatamente. Además, documentamos el estado del vehículo antes y después del transporte."
    },
    {
      question: "¿Cuánto cuesta el servicio?",
      answer: "El precio depende de la distancia, tipo de vehículo y urgencia del servicio. Ofrecemos presupuestos transparentes sin costes ocultos. Puedes obtener una cotización instantánea en nuestra plataforma."
    },
    {
      question: "¿Cómo puedo convertirme en drover?",
      answer: "Para ser drover necesitas: licencia de conducir vigente, experiencia de conducción, pasar nuestro proceso de verificación y completar la formación. El proceso de registro es simple y te guiamos paso a paso."
    },
    {
      question: "¿En qué zonas operan?",
      answer: "Operamos en toda España, cubriendo las principales ciudades y rutas nacionales. Tenemos drovers disponibles en más de 50 ciudades de las 17 comunidades autónomas."
    }
  ];

  return (
    <section className="px-4 pt-24 pb-16 md:pb-20 bg-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Preguntas frecuentes
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestro servicio de transporte de vehículos
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white/5 rounded-2xl border border-white/10 px-6"
            >
              <AccordionTrigger className="text-white hover:text-drove-accent text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/70 pb-4 text-left">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
