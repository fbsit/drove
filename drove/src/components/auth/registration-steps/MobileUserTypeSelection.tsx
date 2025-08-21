
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Car } from 'lucide-react';
import { UserType } from '@/types/new-registration';
import DroveLogo from '@/components/DroveLogo';

interface Props {
  onSelect: (type: UserType) => void;
}

const MobileUserTypeSelection: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="text-center space-y-6">
      {/* Logo DROVE más grande */}
      <div className="flex justify-center mb-6">
        <DroveLogo size="lg" />
      </div>

      {/* Título y descripción compactos */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">
          Únete a DROVE
        </h2>
        <p className="text-white/70 text-sm">
          Selecciona tu tipo de cuenta
        </p>
      </div>

      {/* Cards compactas para móvil */}
      <div className="space-y-4">
        {/* Cliente/Empresa Card */}
        <div 
          className="bg-white/5 border border-white/20 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          onClick={() => onSelect('client')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#6EF7FF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-[#6EF7FF]" />
            </div>
            
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-white mb-1">
                Empresa o Cliente
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Solicita traslados de vehículos de forma rápida y segura
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full mt-3 bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold text-sm h-10"
            onClick={() => onSelect('client')}
          >
            Registrarse como Cliente
          </Button>
        </div>

        {/* Drover Card */}
        <div 
          className="bg-white/5 border border-white/20 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
          onClick={() => onSelect('drover')}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#6EF7FF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6 text-[#6EF7FF]" />
            </div>
            
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-white mb-1">
                DROVER
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Genera ingresos realizando traslados de vehículos
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full mt-3 bg-[#6EF7FF] hover:bg-[#6EF7FF]/80 text-[#22142A] font-bold text-sm h-10"
            onClick={() => onSelect('drover')}
          >
            Postular como Drover
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileUserTypeSelection;
