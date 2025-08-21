
import React from 'react';
import { Search, MapPin, Filter, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface DriversFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'todos' | 'disponible' | 'ocupado';
  setStatusFilter: (status: 'todos' | 'disponible' | 'ocupado') => void;
  sortBy: 'distancia' | 'rating' | 'viajes' | 'nombre';
  setSortBy: (sort: 'distancia' | 'rating' | 'viajes' | 'nombre') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const DriversFilters: React.FC<DriversFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <Input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-white/20 text-white hover:bg-white/10 rounded-2xl px-4"
        >
          <Filter size={16} className="mr-2" />
          Filtros
        </Button>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
          {/* Filtro por disponibilidad */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium flex items-center gap-2">
              <User size={16} className="text-[#6EF7FF]" />
              Disponibilidad
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#22142A] border-white/20">
                <SelectItem value="todos" className="text-white hover:bg-white/10">Todos</SelectItem>
                <SelectItem value="disponible" className="text-white hover:bg-white/10">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Disponible
                  </span>
                </SelectItem>
                <SelectItem value="ocupado" className="text-white hover:bg-white/10">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    Ocupado
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por ordenación */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium flex items-center gap-2">
              <MapPin size={16} className="text-[#6EF7FF]" />
              Ordenar por
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#22142A] border-white/20">
                <SelectItem value="distancia" className="text-white hover:bg-white/10">Cercanía al origen</SelectItem>
                <SelectItem value="rating" className="text-white hover:bg-white/10">Mayor calificación</SelectItem>
                <SelectItem value="viajes" className="text-white hover:bg-white/10">Más viajes completados</SelectItem>
                <SelectItem value="nombre" className="text-white hover:bg-white/10">Nombre (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Información de resultados */}
          <div className="flex items-end">
            <div className="text-white/60 text-sm">
              <p>Filtros activos para encontrar</p>
              <p>el drover más adecuado</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversFilters;
