export type TipoOrden =
  | "INSTALACION_FTTH"
  | "REUBICACION_BAJADA"
  | "MIGRACION_HFC_A_FTTH";

export type EstadoOrden =
  | "PENDIENTE"
  | "EN_PROGRESO"
  | "FINALIZADA";

export type GeoPoint = {
  lat: number;
  lng: number;
  ref?: string;
};

export interface Orden {
  id: number;
  numero: string;
  tipo: TipoOrden;

  abonadoNombre: string;
  telefono?: string;

  planMbps?: number | null;
  macEquipo?: string;

  referenciaCasa?: string;
  descripcion?: string;

  estado: EstadoOrden;

  ubicacion?: GeoPoint | null;
  ubicacionAnterior?: GeoPoint | null;
  ubicacionNueva?: GeoPoint | null;

  createdAt: number;
  updatedAt: number;
  barrio?: string;
  tecnico?: string;

}
