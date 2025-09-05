import { AdminTransfersResponse } from "../api/types/admin";

// Mock para traslados administrativos
export default (): AdminTransfersResponse => {
  return {
    transfers: [
      {
        id: "transfer-123",
        status: "en_progreso",
        created_at: new Date().toISOString(),
        price: 450.75,
        users: {
          full_name: "Carlos Fernández",
          email: "carlos@ejemplo.com",
          company_name: null,
        },
        drivers: {
          full_name: "Miguel Rodríguez",
        },
        pickup_details: {
          originAddress: "Calle Gran Vía 1, Madrid",
          destinationAddress: "Paseo de Gracia 43, Barcelona",
        },
        vehicle_details: {
          brand: "Mercedes",
          model: "Clase C",
        },
      },
      {
        id: "transfer-456",
        status: "completado",
        created_at: new Date(Date.now() - 604800000).toISOString(), // Una semana antes
        price: 380.5,
        users: {
          full_name: "Empresa Automoción S.L.",
          email: "info@automocion.es",
          company_name: "Automoción S.L.",
        },
        drivers: {
          full_name: "Laura Sánchez",
        },
        pickup_details: {
          originAddress: "Plaza España 5, Sevilla",
          destinationAddress: "Avenida Diagonal 300, Barcelona",
        },
        vehicle_details: {
          brand: "BMW",
          model: "Serie 3",
        },
      },
      {
        id: "transfer-789",
        status: "pendiente",
        created_at: new Date(Date.now() + 604800000).toISOString(), // Una semana después
        price: 520.0,
        users: {
          full_name: "Ana Martínez",
          email: "ana@ejemplo.com",
          company_name: null,
        },
        drivers: null,
        pickup_details: {
          originAddress: "Calle Alcalá 45, Madrid",
          destinationAddress: "Paseo Marítimo 20, Valencia",
        },
        vehicle_details: {
          brand: "Audi",
          model: "A4",
        },
      },
      {
        id: "transfer-890",
        status: "asignado",
        created_at: new Date(Date.now() + 172800000).toISOString(), // 2 días después
        price: 315.75,
        users: {
          full_name: "José García",
          email: "jose.garcia@email.com",
          company_name: null,
        },
        drivers: {
          full_name: "Carmen López",
        },
        pickup_details: {
          originAddress: "Avenida de la Paz 78, Zaragoza",
          destinationAddress: "Calle Mayor 123, Madrid",
        },
        vehicle_details: {
          brand: "Volkswagen",
          model: "Golf",
        },
      },
      {
        id: "transfer-901",
        status: "asignado",
        created_at: new Date(Date.now() + 345600000).toISOString(), // 4 días después
        price: 280.25,
        users: {
          full_name: "Transportes Jiménez S.A.",
          email: "admin@transportesjimenez.es",
          company_name: "Transportes Jiménez S.A.",
        },
        drivers: {
          full_name: "Alberto Ruiz",
        },
        pickup_details: {
          originAddress: "Polígono Industrial Norte, Bilbao",
          destinationAddress: "Puerto de Barcelona, Barcelona",
        },
        vehicle_details: {
          brand: "Ford",
          model: "Transit",
        },
      },
    ],
  };
};
