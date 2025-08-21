
import React from "react";
import ClientCard, { Client } from "./ClientCard";
import { useNavigate } from "react-router-dom";

interface ClientsGridProps {
  clients: any[];
  onApprove?: (clientId: string) => void;
  onReject?: (clientId: string) => void;
  isLoading?: boolean;
}

const ClientsGrid: React.FC<ClientsGridProps> = ({ clients, onApprove, onReject, isLoading }) => {
  const navigate = useNavigate();

  const handleVerPerfil = (client: any) => {
    navigate(`/admin/clientes/${client.id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {clients.map(client => (
        <ClientCard key={client.id} client={client} onClickPerfil={() => handleVerPerfil(client)} />
      ))}
    </div>
  );
};

export default ClientsGrid;
