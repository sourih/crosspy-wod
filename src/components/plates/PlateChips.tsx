import type { Combination } from '../../types';
import { formatKg } from '../../utils/weight';
import { plateLook } from './plateLook';

interface Props {
  combination: Combination;
  /** true cuando la lista ya está sobre un panel interno: las fichas suben un tono. */
  onRaised?: boolean;
}

/*
 * Los discos de un lado como fichas. Cada peso va dentro de una placa del
 * color del disco, así se reconoce de un vistazo; los fraccionales son placas
 * más bajas y con borde, para no confundirlos con el bumper del mismo color.
 */
export function PlateChips({ combination, onRaised = false }: Props) {
  if (combination.length === 0) {
    return <p className="text-body text-muted">Sin discos: solo la barra.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {combination.map((plate) => {
        const look = plateLook(plate.weight);
        return (
          <li
            key={plate.weight}
            className={`num inline-flex h-9 flex-none items-center gap-1.5 rounded-chip pr-1 text-body whitespace-nowrap ${
              plate.count > 1 ? 'pl-2.5' : 'pl-1'
            } ${onRaised ? 'bg-[#383838]' : 'bg-raised'}`}
          >
            {plate.count > 1 && <span className="text-muted">{plate.count} ×</span>}
            <span
              className={`inline-flex items-center rounded-[4px] font-semibold ${
                look.thin ? 'h-6 px-1.5 text-small' : 'h-7 px-2'
              }`}
              style={{
                background: look.fill,
                color: look.ink,
                boxShadow: look.thin
                  ? `inset 0 0 0 1px ${look.edge ?? 'rgba(0,0,0,0.35)'}`
                  : undefined,
              }}
            >
              {formatKg(plate.weight)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
