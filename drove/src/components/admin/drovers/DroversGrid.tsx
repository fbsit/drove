
import React from "react";
import DroverCard from "./DroverCard";
import { Drover } from "@/types/drover";
import { useNavigate } from "react-router-dom";

// Proporcionar los tipos correctos, y el callback para ver perfil
interface DroversGridProps {
  drovers: any[];
  onApprove?: (droverId: string) => void;
  onReject?: (droverId: string) => void;
  isLoading?: boolean;
}

const DroversGrid: React.FC<DroversGridProps> = ({ drovers, onApprove, onReject, isLoading }) => {
  const navigate = useNavigate();

  const handleVerPerfil = (drover: any) => {
    navigate(`/admin/drovers/${drover.id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {drovers.map(drover => (
        <DroverCard
          key={drover.id}
          drover={drover}
          onClickPerfil={() => handleVerPerfil(drover)}
        />
      ))}
    </div>
  );
};

export default DroversGrid;
