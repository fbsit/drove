
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DroveButton from '@/components/DroveButton';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-drove px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-drove-accent transition-colors mb-6">
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Política de Privacidad</h1>
          <p className="text-white/70">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 space-y-8">
          
          {/* Datos del Responsable */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Datos del Responsable del Tratamiento</h2>
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

          {/* Normativa Aplicable */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1.1. Normativa aplicable</h2>
            <p className="text-white/80 mb-4">
              Nuestra Política de Privacidad se ha diseñado de acuerdo con el Reglamento General de Protección de Datos de la UE 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos y por el que se deroga la Directiva 95/46/CE (Reglamento general de protección de datos), y la Ley Orgánica 3/2018 del 5 de diciembre, de Protección de Datos de Carácter Personal y Garantía de los Derechos Digitales.
            </p>
            <p className="text-white/80">
              Al facilitarnos sus datos, Usted declara haber leído y conocer la presente Política de Privacidad, prestando su consentimiento inequívoco y expreso al tratamiento de sus datos personales de acuerdo a las finalidades y términos aquí expresados.
            </p>
          </section>

          {/* Delegado de Protección de Datos */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1.2. Delegado de Protección de Datos</h2>
            <p className="text-white/80 mb-4">
              Actualmente, nuestra organización no cuenta con un Delegado de Protección de Datos (DPD). No obstante, nos tomamos muy en serio la protección y privacidad de sus datos personales. Hemos implementado medidas y políticas adecuadas para asegurar que su información esté protegida y se gestione de acuerdo con las leyes y regulaciones aplicables en materia de protección de datos.
            </p>
            <p className="text-white/80">
              Para cualquier consulta, solicitud de información adicional, o ejercicio de sus derechos relacionados con la protección de datos, puede contactarnos a través de transportes@droveland.es o al teléfono +34 611 59 14 29.
            </p>
          </section>

          {/* Finalidades del Tratamiento */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Finalidad del Tratamiento de los Datos Personales</h2>
            <p className="text-white/80 mb-4">El tratamiento que realizamos de sus datos personales responde a las siguientes finalidades específicas de nuestra plataforma de transporte de vehículos:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li><strong>Prestación de servicios de transporte:</strong> Para conectar clientes con drovers verificados y gestionar servicios de transporte de vehículos</li>
              <li><strong>Seguimiento GPS en tiempo real:</strong> Para proporcionar ubicación precisa durante el transporte y garantizar la seguridad del vehículo</li>
              <li><strong>Verificación por código QR:</strong> Para confirmar la recogida y entrega de vehículos mediante sistema de verificación digital</li>
              <li><strong>Documentación fotográfica:</strong> Para registrar el estado del vehículo antes y después del transporte</li>
              <li><strong>Verificación de identidad:</strong> Para validar la identidad de drovers y clientes garantizando la seguridad del servicio</li>
              <li><strong>Gestión de pagos:</strong> Para procesar pagos seguros a través de la plataforma</li>
              <li><strong>Sistema de valoraciones:</strong> Para permitir reseñas entre clientes y drovers mejorando la calidad del servicio</li>
              <li><strong>Comunicación durante servicios:</strong> Para facilitar comunicación entre partes durante el transporte</li>
              <li><strong>Cumplimiento legal:</strong> Para cumplir obligaciones legales y reglamentarias del sector transporte</li>
              <li><strong>Seguridad de la plataforma:</strong> Para detectar, prevenir y abordar problemas técnicos y de seguridad</li>
            </ul>
          </section>

          {/* Plazo de Conservación */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2.1. Plazo de Conservación de sus datos</h2>
            <p className="text-white/80">
              Conservaremos sus datos personales desde que nos dé su consentimiento hasta que lo revoque o bien solicite la limitación del tratamiento. Los datos de geolocalización y fotografías de vehículos se conservan únicamente durante la duración del servicio más un período adicional de 30 días para resolución de incidencias. En casos de disputas, mantendremos los datos de manera bloqueada durante los plazos legalmente exigidos.
            </p>
          </section>

          {/* Legitimación y Datos Recabados */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Legitimación y Datos Recabados</h2>
            <p className="text-white/80 mb-4">
              La legitimación para el tratamiento de sus datos es el consentimiento expreso otorgado mediante un acto positivo y afirmativo al registrarse en nuestra plataforma y aceptar esta política de privacidad.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-drove-accent mb-2">3.2. Categorías de datos específicos de DROVE</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-white">Datos de identificación personal:</h4>
                    <p className="text-white/80 text-sm">Nombre, apellidos, DNI/NIE, dirección, correo electrónico, número de teléfono</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Datos de drovers:</h4>
                    <p className="text-white/80 text-sm">Licencia de conducir, experiencia, vehículo propio, documentación de identificación, historial de servicios</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Datos de vehículos:</h4>
                    <p className="text-white/80 text-sm">Marca, modelo, año, matrícula, documentación vehicular, fotografías del estado</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Datos de geolocalización:</h4>
                    <p className="text-white/80 text-sm">Ubicación GPS en tiempo real durante transportes, rutas seguidas, tiempos de recogida y entrega</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Datos de transacciones:</h4>
                    <p className="text-white/80 text-sm">Historial de pagos, métodos de pago, facturas, valoraciones y reseñas</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Datos técnicos:</h4>
                    <p className="text-white/80 text-sm">Dirección IP, tipo de navegador, sistema operativo, datos de cookies, identificadores de dispositivo</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Medidas de Seguridad */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Medidas de Seguridad</h2>
            <p className="text-white/80 mb-4">
              Dentro de nuestro compromiso por garantizar la seguridad y confidencialidad de sus datos de carácter personal, hemos adoptado medidas de índole técnica y organizativas específicas para una plataforma de transporte:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Cifrado de extremo a extremo para datos sensibles</li>
              <li>Encriptación de datos de geolocalización durante transmisión</li>
              <li>Almacenamiento seguro de fotografías con acceso limitado</li>
              <li>Autenticación multifactor para drovers verificados</li>
              <li>Monitoreo continuo de accesos y actividades sospechosas</li>
              <li>Backups seguros y recuperación ante desastres</li>
            </ul>
          </section>

          {/* Cesión de Datos */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cesión de Datos</h2>
            <p className="text-white/80">
              No se prevén cesiones de datos a terceros, excepto las estrictamente necesarias para la prestación del servicio (procesadores de pago, servicios de mapas, verificación de identidad) y las autorizadas por la legislación fiscal, mercantil y de telecomunicaciones, así como en aquellos casos en los que una autoridad judicial nos lo requiera. Los datos de ubicación se comparten únicamente entre cliente y drover durante el servicio activo.
            </p>
          </section>

          {/* Derechos del Usuario */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Derechos del Usuario</h2>
            <p className="text-white/80 mb-4">
              De acuerdo con la legislación vigente, usted tiene los siguientes derechos respecto a sus datos personales:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li><strong>Derecho de acceso:</strong> Conocer qué datos tratamos y cómo</li>
              <li><strong>Derecho de rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Derecho de supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Derecho de limitación:</strong> Restringir el tratamiento en determinadas circunstancias</li>
              <li><strong>Derecho de oposición:</strong> Oponerse al tratamiento por motivos particulares</li>
              <li><strong>Derecho a la portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Derecho a retirar el consentimiento:</strong> En cualquier momento sin efectos retroactivos</li>
            </ul>
            
            <div className="mt-4 bg-white/5 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-drove-accent mb-2">6.1. ¿Cómo ejercitar mis derechos?</h3>
              <p className="text-white/80 mb-2">
                Para ejercer sus derechos, puede contactarnos a través de:
              </p>
              <ul className="text-white/80 space-y-1">
                <li><strong>Email:</strong> transportes@droveland.es</li>
                <li><strong>Teléfono:</strong> +34 611 59 14 29</li>
                <li><strong>Dirección postal:</strong> Calle Eras, 54. 3D. Alcantarilla, Murcia. 30820</li>
              </ul>
              <p className="text-white/80 text-sm mt-2">
                Recuerde acompañar una copia de un documento que nos permita identificarle.
              </p>
            </div>
          </section>

          {/* Comunicaciones Electrónicas */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Consentimiento para Comunicaciones Electrónicas</h2>
            <p className="text-white/80">
              De acuerdo con la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, al registrarse en nuestra plataforma y aceptar recibir comunicaciones, está otorgando consentimiento expreso para enviarle información sobre servicios de transporte, actualizaciones de la plataforma, y comunicaciones relacionadas con sus servicios activos.
            </p>
          </section>

          {/* Información Adicional */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Información Adicional</h2>
            <p className="text-white/80">
              Para más información sobre el tratamiento de sus datos, puede consultar nuestros <Link to="/terminos" className="text-drove-accent hover:underline">Términos de Uso</Link> y nuestra política de cookies. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
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

export default PrivacyPolicy;
