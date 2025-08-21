
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import DroveLogo from "@/components/DroveLogo";
import DroveButton from "@/components/DroveButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-drove p-6">
      <DroveLogo size="lg" className="mb-12" />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-8">Página no encontrada</p>
        <DroveButton variant="default" size="lg" className="uppercase">
          <a href="/">Volver al inicio</a>
        </DroveButton>
      </div>
    </div>
  );
};

export default NotFound;
