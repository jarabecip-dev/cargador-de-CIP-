import { Timestamp } from 'firebase/firestore';

export type Tarea = "Línea 1" | "Línea 2" | "Línea 3" | "TK 1" | "TK 2" | "TK 3";
export type CIP = "CIP1" | "CIP2" | "CIP3";

export interface Registro {
  id: number;
  tarea: Tarea;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  dato_numerico: number;
  cip: CIP;
  created_at: Timestamp;
}

export interface RegistroFormValues {
  tarea: Tarea;
  fecha: string;
  hora: string;
  dato_numerico: number;
  cip: CIP;
}
