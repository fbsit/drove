
// Lista de marcas de vehículos por tipo en España
export const vehicleBrandsByType = {
  coche: [
    "Audi",
    "BMW",
    "Citroën",
    "CUPRA",
    "Dacia",
    "Fiat",
    "Ford",
    "Honda",
    "Hyundai",
    "Kia",
    "Mercedes-Benz",
    "Nissan",
    "Opel",
    "Peugeot",
    "Renault",
    "SEAT",
    "Škoda",
    "Toyota",
    "Volkswagen",
    "Volvo"
  ].sort(),
  camioneta: [
    "Citroën",
    "Dacia",
    "Fiat",
    "Ford",
    "Iveco",
    "Mercedes-Benz",
    "Nissan",
    "Opel",
    "Peugeot",
    "Renault",
    "Toyota",
    "Volkswagen"
  ].sort()
};

// Para compatibilidad con código existente
export const vehicleBrands = Object.values(vehicleBrandsByType)
  .flat()
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort();

export const getValidYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year.toString());
  }
  return years;
};

export const getModelsByBrand = (brand: string, year: string, vehicleType: string = "coche"): string[] => {
  // Verificar si brand es undefined o null
  if (!brand) return [];
  
  // Asegurarse de que vehicleType sea un valor válido
  const validType = (vehicleType && vehicleType in vehicleBrandsByType) ? vehicleType : "coche";
  
  // Verificar si la marca existe para el tipo de vehículo seleccionado
  const brandsForType = vehicleBrandsByType[validType as keyof typeof vehicleBrandsByType] || [];
  if (!brandsForType.includes(brand)) return [];
  
  // Simplified model data - in a real app this would be a more complete database
  const modelsByBrand: Record<string, Record<string, string[]>> = {
    coche: {
      "Audi": ["A1", "A3", "A4", "A5", "A6", "Q3", "Q5", "Q7"],
      "BMW": ["Serie 1", "Serie 2", "Serie 3", "Serie 4", "Serie 5", "X1", "X3", "X5"],
      "SEAT": ["Ibiza", "León", "Arona", "Ateca", "Tarraco"],
      "Volkswagen": ["Golf", "Polo", "Passat", "T-Roc", "Tiguan", "Touran"],
      "Mercedes-Benz": ["Clase A", "Clase B", "Clase C", "Clase E", "GLA", "GLC", "CLA"],
      "Toyota": ["Corolla", "Yaris", "RAV4", "C-HR", "Prius", "Camry"],
      "Renault": ["Clio", "Megane", "Captur", "Kadjar", "Scenic", "Arkana"],
      "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Mondeo", "Mustang"],
      "Peugeot": ["208", "308", "2008", "3008", "5008", "508"],
      "Citroën": ["C3", "C4", "C5", "Berlingo", "C3 Aircross", "C5 Aircross"],
      // Añade más marcas según sea necesario
    },
    camioneta: {
      "Ford": ["Transit", "Transit Custom", "Transit Connect", "Ranger"],
      "Mercedes-Benz": ["Sprinter", "Vito", "Citan"],
      "Volkswagen": ["Transporter", "Crafter", "Caddy", "Amarok"],
      "Renault": ["Master", "Trafic", "Kangoo", "Alaskan"],
      "Citroën": ["Jumper", "Jumpy", "Berlingo"],
      "Peugeot": ["Boxer", "Expert", "Partner", "Rifter"],
      "Fiat": ["Ducato", "Talento", "Doblo", "Fiorino"],
      "Iveco": ["Daily", "Eurocargo"],
      "Nissan": ["NV200", "NV300", "NV400", "Navara"],
      "Toyota": ["Proace", "Hilux"],
      "Opel": ["Movano", "Vivaro", "Combo"],
      "Dacia": ["Dokker"]
    }
  };

  // Acceder de forma segura a los modelos
  try {
    const typeModels = modelsByBrand[validType] || {};
    return typeModels[brand] || [];
  } catch (error) {
    console.error("Error al obtener modelos:", error);
    return [];
  }
};
