/*
 * Solo desarrollo: datos de prueba para la Calculadora RM. Se eligen con
 * ?data=<nombre> en la URL y se escriben en LocalStorage antes de montar la
 * app, por el mismo camino que los datos reales. Nunca entra al build.
 */
import { createDefaultSettings } from '../data/defaults';
import { STORAGE_KEYS } from '../services/storage/repositories';
import type { BoxSettings } from '../types';
import { kg } from '../utils/weight';

interface Fixture {
  label: string;
  settings: BoxSettings;
  rm: { reference: string; percent: number; barWeight: number };
}

const base = createDefaultSettings();
const full = (s: BoxSettings): BoxSettings => ({
  ...s,
  inventory: s.inventory.map((item) => ({ ...item, quantity: 40 })),
});

export const FIXTURES: Record<string, Fixture> = {
  demo: { label: 'Demo', settings: base, rm: { reference: '100', percent: 750, barWeight: kg(20) } },
  peor: {
    label: 'Peor caso',
    // RM con 2 decimales y % personalizado: 87,35 × 72,5 % = 63,32875 kg.
    // Coach que cargó seis barras y la escala completa de 2,5 en 2,5 %.
    settings: {
      ...base,
      bars: [20, 15, 12, 10, 7, 5].map((w) => ({ id: `b${w}`, name: 'Barra', weight: kg(w) })),
      rmPercentages: Array.from({ length: 29 }, (_, i) => 300 + i * 25),
    },
    rm: { reference: '87,35', percent: 725, barWeight: kg(12) },
  },
  pesado: {
    label: '600 kg',
    // El máximo del formulario al máximo porcentaje, con el box lleno.
    settings: full(base),
    rm: { reference: '600', percent: 2000, barWeight: kg(20) },
  },
  muchos: {
    label: 'Muchos discos',
    // Carga exacta que obliga a cargar fraccionales de todo tipo.
    settings: full(base),
    rm: { reference: '397,5', percent: 1000, barWeight: kg(20) },
  },
  minimo: {
    label: '0,5 kg',
    settings: base,
    rm: { reference: '0,5', percent: 400, barWeight: kg(20) },
  },
  vacio: {
    label: 'Box vacío',
    settings: { ...base, inventory: base.inventory.map((item) => ({ ...item, quantity: 0 })) },
    rm: { reference: '100', percent: 750, barWeight: kg(20) },
  },
};

/** Si la URL pide un fixture, lo escribe en LocalStorage. Devuelve el elegido. */
export function applyFixtureFromUrl(): string | null {
  const name = new URLSearchParams(window.location.search).get('data');
  const fixture = name ? FIXTURES[name] : undefined;
  if (!name || !fixture) return null;
  const storedDrafts = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.drafts) ?? '{}');
  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(fixture.settings));
  window.localStorage.setItem(
    STORAGE_KEYS.drafts,
    JSON.stringify({ ...storedDrafts, rm: fixture.rm }),
  );
  return name;
}
