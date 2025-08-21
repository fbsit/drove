
import React from "react";
import { Search, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReviewFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  filterRating: string;
  setFilterRating: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDrover: string;
  setFilterDrover: (value: string) => void;
  drovers: string[];
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  search,
  setSearch,
  filterRating,
  setFilterRating,
  filterStatus,
  setFilterStatus,
  filterDrover,
  setFilterDrover,
  drovers
}) => {
  return (
    <div className="bg-white/10 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-[#6EF7FF]" />
        <h3 className="text-white font-semibold">Filtros de Reseñas</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
          <Input
            placeholder="Buscar cliente o comentario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Valoración" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las valoraciones</SelectItem>
            <SelectItem value="5">5 estrellas</SelectItem>
            <SelectItem value="4">4 estrellas</SelectItem>
            <SelectItem value="3">3 estrellas</SelectItem>
            <SelectItem value="2">2 estrellas</SelectItem>
            <SelectItem value="1">1 estrella</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="nueva">Nuevas</SelectItem>
            <SelectItem value="vista">Vistas</SelectItem>
            <SelectItem value="respondida">Respondidas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDrover} onValueChange={setFilterDrover}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Drover" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los drovers</SelectItem>
            {drovers.map(drover => (
              <SelectItem key={drover} value={drover}>{drover}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReviewFilters;
