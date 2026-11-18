import type { Mg } from '../../types';
import { plateLook } from './plateLook';

/**
 * El disco en miniatura, de perfil, para listas de inventario. Alto
 * proporcional al disco real; los oscuros llevan borde para no perderse.
 */
export function PlateSwatch({ weight, scale = 1 / 3.6 }: { weight: Mg; scale?: number }) {
  const look = plateLook(weight);
  return (
    <span className="grid w-3 flex-none place-items-center" aria-hidden>
      <span
        className="rounded-[2px]"
        style={{
          width: look.thin ? 5 : 9,
          height: Math.round(look.height * scale),
          background: look.fill,
          boxShadow: look.edge ? `inset 0 0 0 1px ${look.edge}` : undefined,
        }}
      />
    </span>
  );
}
