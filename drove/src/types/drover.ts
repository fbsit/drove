
export interface Drover {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
  estado: "aprobado" | "pendiente" | "rechazado";
  traslados: number;
  calificacion: number;
  tiempo: string;
  /** "core" para contratados, "flex" para autónomos */
  tipoDrover: "core" | "flex";
  motivoRechazo?: string;
}
