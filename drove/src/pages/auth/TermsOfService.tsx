
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DroveButton from '@/components/DroveButton';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-drove px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-drove-accent transition-colors mb-6">
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Términos de Uso</h1>
          <p className="text-white/70">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-8">
          
          {/* Aviso Legal */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Aviso Legal</h2>
            <p className="text-white/80 mb-4">
              Con la finalidad de dar cumplimiento al artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico, informamos al usuario de nuestros datos:
            </p>
            <div className="bg-white/5 p-4 rounded-xl space-y-2 text-white/80">
              <p><strong>Denominación Social:</strong> DROVELAND INTERNATIONAL S.L.</p>
              <p><strong>Nombre Comercial:</strong> DROVE</p>
              <p><strong>Domicilio Social:</strong><br />
                Calle Eras, 54. 3D.<br />
                Alcantarilla, Murcia. 30820.
              </p>
              <p><strong>CIF:</strong> B72713647</p>
              <p><strong>Teléfono:</strong> +34 611 59 14 29</p>
              <p><strong>Email:</strong> transportes@droveland.es</p>
            </div>
          </section>

          {/* Objeto */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Objeto de la Plataforma</h2>
            <p className="text-white/80 mb-4">
              DROVE es una plataforma digital que conecta a clientes que necesitan transportar vehículos con conductores profesionales verificados (denominados "drovers"). Nuestro servicio incluye:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Matching inteligente entre clientes y drovers disponibles</li>
              <li>Seguimiento GPS en tiempo real durante el transporte</li>
              <li>Sistema de verificación por código QR para recogida y entrega</li>
              <li>Proceso de verificación de identidad y documentación</li>
              <li>Gestión de pagos seguros a través de la plataforma</li>
              <li>Sistema de valoraciones y reseñas</li>
              <li>Soporte técnico y operativo 24/7</li>
            </ul>
          </section>

          {/* Condiciones de Uso */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Condiciones de Uso</h2>
            <p className="text-white/80 mb-4">
              Toda persona que acceda a esta plataforma asume el papel de usuario, comprometiéndose a la observancia y cumplimiento riguroso de las disposiciones aquí dispuestas, así como a cualquier otra disposición legal que fuera de aplicación.
            </p>
            <p className="text-white/80">
              El prestador se reserva el derecho a modificar cualquier tipo de información que pudiera aparecer en la plataforma, sin que exista obligación de preavisar o poner en conocimiento de los usuarios dichas obligaciones, entendiéndose como suficiente con la publicación en la plataforma del prestador.
            </p>
          </section>

          {/* Responsabilidades Específicas de la Plataforma */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Responsabilidades de la Plataforma</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-2">Verificación de Drovers</h3>
                <p className="text-white/80">
                  DROVE realiza un proceso de verificación que incluye validación de licencia de conducir, antecedentes y experiencia. Sin embargo, la responsabilidad final del transporte recae en el drover asignado.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-2">Tracking GPS y Datos de Ubicación</h3>
                <p className="text-white/80">
                  La plataforma recopila y procesa datos de ubicación para proporcionar el servicio de seguimiento en tiempo real. Estos datos se utilizan exclusivamente para la prestación del servicio y se eliminan una vez completado el transporte.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-2">Documentación Fotográfica</h3>
                <p className="text-white/80">
                  Se requiere documentación fotográfica del vehículo antes y después del transporte. Estas imágenes se almacenan de forma segura y se utilizan únicamente para verificación del estado del vehículo.
                </p>
              </div>
            </div>
          </section>

          {/* Obligaciones de los Usuarios */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Obligaciones de los Usuarios</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-2">Clientes</h3>
                <ul className="list-disc list-inside text-white/80 space-y-1 ml-4">
                  <li>Proporcionar información veraz sobre el vehículo a transportar</li>
                  <li>Estar presente en el momento de recogida y entrega</li>
                  <li>Facilitar la documentación necesaria del vehículo</li>
                  <li>Realizar el pago según las condiciones acordadas</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-2">Drovers</h3>
                <ul className="list-disc list-inside text-white/80 space-y-1 ml-4">
                  <li>Mantener licencia de conducir válida y seguro vigente</li>
                  <li>Seguir las rutas establecidas y procedimientos de seguridad</li>
                  <li>Completar la verificación QR en recogida y entrega</li>
                  <li>Mantener comunicación con la plataforma durante el transporte</li>
                  <li>Tratar el vehículo con el máximo cuidado</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Veracidad de la Información */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Veracidad de la Información</h2>
            <p className="text-white/80">
              Toda la información que facilita el Usuario tiene que ser veraz. A estos efectos, el Usuario garantiza la autenticidad de los datos comunicados a través de los formularios para la suscripción de los Servicios. Será responsabilidad del Usuario mantener toda la información facilitada permanentemente actualizada. En todo caso, el Usuario será el único responsable de las manifestaciones falsas o inexactas que realice y de los perjuicios que cause al prestador o a terceros.
            </p>
          </section>

          {/* Menores de Edad */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Menores de Edad</h2>
            <p className="text-white/80">
              Para el uso de los servicios, los menores de edad tienen que obtener siempre previamente el consentimiento de los padres, tutores o representantes legales, responsables últimos de todos los actos realizados por los menores a su cargo.
            </p>
          </section>

          {/* Propiedad Intelectual */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Propiedad Intelectual e Industrial</h2>
            <p className="text-white/80 mb-4">
              La plataforma, incluyendo su programación, edición, compilación y demás elementos necesarios para su funcionamiento, los diseños, logotipos, texto y/o gráficos son propiedad del prestador o dispone de licencia o autorización expresa por parte de los autores.
            </p>
            <p className="text-white/80">
              Todos los contenidos de la plataforma se encuentran debidamente protegidos por la normativa de propiedad intelectual e industrial. Cualquier uso no autorizado será considerado un incumplimiento grave de los derechos de propiedad intelectual o industrial.
            </p>
          </section>

          {/* Ley Aplicable */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Ley Aplicable y Jurisdicción</h2>
            <p className="text-white/80">
              Para la resolución de todas las controversias o cuestiones relacionadas con la presente plataforma o de las actividades en ella desarrolladas, será de aplicación la legislación española, a la que se someten expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o relacionados con su uso los Juzgados y Tribunales de la Comunidad Autónoma de la Región de Murcia.
            </p>
          </section>

        </div>

        {/* Footer con botón de vuelta */}
        <div className="mt-8 text-center">
          <Link to="/">
            <DroveButton variant="accent" size="lg">
              Volver al inicio
            </DroveButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
