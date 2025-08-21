
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DroveButton from '@/components/DroveButton';

const CookiesPolicy = () => {
  return (
    <div className="min-h-screen bg-drove px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-drove-accent transition-colors mb-6">
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Política de Cookies</h1>
          <p className="text-white/70">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-8">
          
          {/* Información General */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Información General</h2>
            <p className="text-white/80">
              Debido a la entrada en vigor de la referente modificación de la "Ley de Servicios de la Sociedad de la Información" (LSSICE) establecida por el Real Decreto 13/2012, es de obligación obtener el consentimiento expreso del usuario de todas las páginas web que usan cookies prescindibles, antes de que éste navegue por ellas.
            </p>
          </section>

          {/* ¿Qué son las cookies? */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">¿Qué son las cookies?</h2>
            <p className="text-white/80 mb-4">
              Las cookies y otras tecnologías similares tales como local shared objects, flash cookies o píxeles, son herramientas empleadas por los servidores Web para almacenar y recuperar información acerca de sus visitantes, así como para ofrecer un correcto funcionamiento del sitio.
            </p>
            <p className="text-white/80">
              Mediante el uso de estos dispositivos se permite al servidor Web recordar algunos datos concernientes al usuario, como sus preferencias para la visualización de las páginas de ese servidor, datos de sesión de drovers, ubicación durante transportes, estado de verificación, etc.
            </p>
          </section>

          {/* Cookies afectadas */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cookies afectadas por la normativa y cookies exceptuadas</h2>
            <p className="text-white/80">
              Según la directiva de la UE, las cookies que requieren el consentimiento informado por parte del usuario son las cookies de analítica y las de publicidad y afiliación, quedando exceptuadas las de carácter técnico y las necesarias para el funcionamiento del sitio web o la prestación de servicios expresamente solicitados por el usuario, como el seguimiento GPS durante transportes activos.
            </p>
          </section>

          {/* Tipos de cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">¿Qué tipos de cookies existen?</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-3">Según su titularidad</h3>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li><strong>Cookies propias:</strong> Son aquéllas que se envían al equipo terminal del usuario desde un equipo o dominio gestionado por DROVE (drove.es) y desde el que se presta el servicio solicitado por el usuario.</li>
                  <li><strong>Cookies de terceros:</strong> Son aquéllas que se envían al equipo terminal del usuario desde un equipo o dominio que no es gestionado por DROVE, sino por otra entidad como Google Maps para geolocalización o procesadores de pago.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-3">Según su duración</h3>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li><strong>Cookies de sesión:</strong> Son un tipo de cookies diseñadas para recabar y almacenar datos mientras el usuario accede a la plataforma DROVE durante un transporte activo.</li>
                  <li><strong>Cookies persistentes:</strong> Son un tipo de cookies en el que los datos siguen almacenados en el terminal para recordar preferencias de usuario, historial de servicios y configuración de drovers verificados.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-3">Según su funcionalidad</h3>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li><strong>Cookies necesarias:</strong> Son aquellas imprescindibles para el correcto funcionamiento de la plataforma DROVE, incluyendo autenticación de usuarios, verificación de drovers y seguimiento GPS durante transportes.</li>
                  <li><strong>Cookies de análisis:</strong> Nos permiten cuantificar el número de usuarios, analizar patrones de uso de la plataforma, rutas más utilizadas y mejorar el matching entre clientes y drovers.</li>
                  <li><strong>Cookies de geolocalización:</strong> Específicas de DROVE para el seguimiento en tiempo real de vehículos durante el transporte, esenciales para la seguridad del servicio.</li>
                  <li><strong>Cookies de verificación:</strong> Para mantener el estado de verificación de documentos de drovers y validación de identidad durante el proceso de registro.</li>
                  <li><strong>Cookies publicitarias:</strong> Para mostrar contenido relevante sobre servicios de transporte y promociones de la plataforma.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Declaración de Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Declaración de Cookies</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-white/80 border border-white/20 rounded-lg">
                <thead className="bg-white/10">
                  <tr>
                    <th className="p-3 text-left border-b border-white/20">Cookie</th>
                    <th className="p-3 text-left border-b border-white/20">Dominio</th>
                    <th className="p-3 text-left border-b border-white/20">Descripción</th>
                    <th className="p-3 text-left border-b border-white/20">Duración</th>
                    <th className="p-3 text-left border-b border-white/20">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="p-3">_ga_*</td>
                    <td className="p-3">drove.es</td>
                    <td className="p-3">Google Analytics para conteo de páginas vistas y análisis de uso de la plataforma</td>
                    <td className="p-3">1 año 1 mes 4 días</td>
                    <td className="p-3">Analítica</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-3">_ga</td>
                    <td className="p-3">drove.es</td>
                    <td className="p-3">Google Analytics para calcular datos de visitantes y sesiones</td>
                    <td className="p-3">1 año 1 mes 4 días</td>
                    <td className="p-3">Analítica</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-3">drove_auth</td>
                    <td className="p-3">drove.es</td>
                    <td className="p-3">Mantiene la sesión de usuario autenticado (cliente/drover/admin)</td>
                    <td className="p-3">7 días</td>
                    <td className="p-3">Necesarias</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-3">drove_location</td>
                    <td className="p-3">drove.es</td>
                    <td className="p-3">Almacena datos de geolocalización durante transportes activos</td>
                    <td className="p-3">Sesión</td>
                    <td className="p-3">Funcionales</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-3">drove_preferences</td>
                    <td className="p-3">drove.es</td>
                    <td className="p-3">Guarda preferencias de usuario y configuración de la plataforma</td>
                    <td className="p-3">30 días</td>
                    <td className="p-3">Funcionales</td>
                  </tr>
                  <tr>
                    <td className="p-3">maps_api</td>
                    <td className="p-3">maps.googleapis.com</td>
                    <td className="p-3">Google Maps para funcionalidad de mapas y rutas en tiempo real</td>
                    <td className="p-3">Sesión</td>
                    <td className="p-3">Necesarias</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Revocación del consentimiento */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Revocación del consentimiento para instalar Cookies</h2>
            <p className="text-white/80 mb-4">Cómo eliminar las Cookies del navegador:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li><strong>Chrome:</strong> <a href="https://support.google.com/chrome/answer/95647" className="text-drove-accent hover:underline" target="_blank" rel="noopener noreferrer">https://support.google.com/chrome/answer/95647</a></li>
              <li><strong>Internet Explorer:</strong> <a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" className="text-drove-accent hover:underline" target="_blank" rel="noopener noreferrer">https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies</a></li>
              <li><strong>Firefox:</strong> <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" className="text-drove-accent hover:underline" target="_blank" rel="noopener noreferrer">https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias</a></li>
              <li><strong>Safari:</strong> <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" className="text-drove-accent hover:underline" target="_blank" rel="noopener noreferrer">https://support.apple.com/es-es/guide/safari/sfri11471/mac</a></li>
              <li><strong>Opera:</strong> <a href="https://www.opera.com/help/tutorials/security/privacy/" className="text-drove-accent hover:underline" target="_blank" rel="noopener noreferrer">https://www.opera.com/help/tutorials/security/privacy/</a></li>
            </ul>
            <p className="text-white/80 text-sm mt-4">
              Si no aparece listado su navegador, consulte la documentación del navegador que tenga instalado para bloquear, eliminar o permitir la descarga de Cookies.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contacto</h2>
            <p className="text-white/80 mb-4">
              Para cualquier consulta sobre nuestra política de cookies, puede contactarnos:
            </p>
            <div className="bg-white/5 p-4 rounded-xl space-y-2 text-white/80">
              <p><strong>Email:</strong> transportes@droveland.es</p>
              <p><strong>Teléfono:</strong> +34 611 59 14 29</p>
              <p><strong>Dirección:</strong> Calle Eras, 54. 3D. Alcantarilla, Murcia. 30820</p>
            </div>
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

export default CookiesPolicy;
