
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

// Aquí simula los datos, en integración real traerás del backend con useQuery
const mockClients = [
  {
    id: 1,
    nombre: "Acme S.A.",
    tipo: "empresa",
    email: "contacto@acmesa.com",
    fecha: "2024-04-01",
    estado: "activo"
  },
  {
    id: 2,
    nombre: "Laura Paredes",
    tipo: "persona",
    email: "laura.paredes@gmail.com",
    fecha: "2024-03-29",
    estado: "pendiente"
  },
  // ...más mock data
];

interface Props {
  clientType: "empresa" | "persona" | "todos";
  search: string;
}

const tipoClienteTexto = (tipo: string) =>
  tipo === "empresa" ? "Empresa" : "Persona natural";

const estadoTexto = (estado: string) =>
  estado === "activo" ? (
    <Badge className="bg-green-500">Activo</Badge>
  ) : (
    <Badge className="bg-amber-500">Pendiente</Badge>
  );

const ClientTable: React.FC<Props> = ({ clientType, search }) => {
  const filtered = mockClients.filter(c => {
    const byType =
      clientType === "todos" ? true : c.tipo === clientType;
    const bySearch =
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return byType && bySearch;
  });

  return (
    <div className="rounded-2xl overflow-x-auto bg-white/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Nombre/Razón social</TableHead>
            <TableHead className="text-white">Tipo</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Fecha de registro</TableHead>
            <TableHead className="text-white">Estado</TableHead>
            <TableHead className="text-white text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-white font-bold">{c.nombre}</TableCell>
                <TableCell className="text-white">{tipoClienteTexto(c.tipo)}</TableCell>
                <TableCell className="text-white">{c.email}</TableCell>
                <TableCell className="text-white">{c.fecha}</TableCell>
                <TableCell>{estadoTexto(c.estado)}</TableCell>
                <TableCell className="text-right">
                  <button className="text-green-400 hover:underline mr-3">Aprobar</button>
                  <button className="text-red-400 hover:underline">Rechazar</button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-white/70">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
