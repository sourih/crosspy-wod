import type { Mg } from '../../types';
import { kg } from '../../utils/weight';

export interface PlateLook {
  /** Alto del disco dibujado, en px (a mayor peso, más alto). */
  height: number;
  /** true para los fraccionales: se dibujan más angostos. */
  thin: boolean;
  fill: string;
  ink: string;
  /** Borde para discos oscuros que se perderían contra el fondo. */
  edge?: string;
}

/*
 * Código de colores de los bumpers del box: 25 rojo, 20 azul, 15 amarillo,
 * 10 verde, 5 blanco. Fraccionales: 2,5 negro, 2 azul, 1,5 amarillo, 1 verde,
 * 0,5 blanco; el de 3 y los pesos no listados van en gris. Además, más pesado
 * = más alto, y cada disco lleva su etiqueta. El naranja no se usa acá; es del
 * resultado.
 */
const LOOKS = new Map<Mg, PlateLook>([
  [kg(25), { height: 120, thin: false, fill: '#d93a3a', ink: '#ffffff' }],
  [kg(20), { height: 108, thin: false, fill: '#2f6fdb', ink: '#ffffff' }],
  [kg(15), { height: 96, thin: false, fill: '#f2c230', ink: '#111111' }],
  [kg(10), { height: 84, thin: false, fill: '#2e9e5b', ink: '#ffffff' }],
  [kg(5), { height: 70, thin: false, fill: '#e8e8e8', ink: '#111111' }],
  [kg(3), { height: 54, thin: true, fill: '#565656', ink: '#ffffff' }],
  [kg(2.5), { height: 50, thin: true, fill: '#050505', ink: '#ffffff', edge: '#8a8a8a' }],
  [kg(2), { height: 46, thin: true, fill: '#2f6fdb', ink: '#ffffff' }],
  [kg(1.5), { height: 43, thin: true, fill: '#f2c230', ink: '#111111' }],
  [kg(1), { height: 40, thin: true, fill: '#2e9e5b', ink: '#ffffff' }],
  [kg(0.5), { height: 34, thin: true, fill: '#e8e8e8', ink: '#111111' }],
]);

/** Aspecto de un disco. Para pesos fuera de la lista se calcula por proporción. */
export function plateLook(weight: Mg): PlateLook {
  const known = LOOKS.get(weight);
  if (known) return known;
  const ratio = Math.min(1, Math.max(0, weight / kg(25)));
  const thin = weight < kg(5);
  return {
    height: Math.round(34 + 86 * Math.sqrt(ratio)),
    thin,
    fill: thin ? '#565656' : '#969696',
    ink: thin ? '#ffffff' : '#111111',
  };
}
