
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Car } from 'lucide-react';
import { UserType } from '@/types/new-registration';

interface Props {
  onSelect: (type: UserType) => void;
}

const UserTypeSelection: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
        Únete a DROVE
      </h2>
      <p className="text-white/70 mb-8 text-lg">
        Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Cliente/Empresa Card */}
        <Card 
          className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
          onClick={() => onSelect('client')}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#6EF7FF]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#6EF7FF]/30 transition-colors">
                <Building2 className="w-8 h-8 text-[#6EF7FF]" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                Empresa o Cliente
              </h3>
              
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Solicita traslados de vehículos de forma rápida y segura. 
                Ideal para empresas de alquiler, concesionarios y particulares.
              </p>
              
              <ul className="text-white/60 text-sm space-y-2 mb-6">
                <li>• Solicitud de traslados inmediata</li>
                <li>• Seguimiento en tiempo real</li>
                <li>• Gestión de múltiples vehículos</li>
                <li>• Facturación automatizada</li>
              </ul>

              <Button 
                className="w-full bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold"
                onClick={() => onSelect('client')}
              >
                Registrarse como Cliente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Drover Card */}
        <Card 
          className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
          onClick={() => onSelect('drover')}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#6EF7FF]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#6EF7FF]/30 transition-colors">
                <Car className="w-8 h-8 text-[#6EF7FF]" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                DROVER
              </h3>
              
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Conviértete en conductor asociado y genera ingresos realizando 
                traslados de vehículos de forma flexible.
              </p>
              
              <ul className="text-white/60 text-sm space-y-2 mb-6">
                <li>• Horarios flexibles</li>
                <li>• Ingresos adicionales</li>
                <li>• Rutas optimizadas</li>
                <li>• Soporte 24/7</li>
              </ul>

              <Button 
                className="w-full bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold"
                onClick={() => onSelect('drover')}
              >
                Postular como Drover
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserTypeSelection;
