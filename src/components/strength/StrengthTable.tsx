import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { NearestLoad, PlateStock, StrengthRow } from '../../types';
import { formatKg, formatLoad, formatPercent, formatSignedLoad, kg } from '../../utils/weight';
import { LoadDetail } from '../calculator/LoadDetail';
import { PlateChips } from '../plates/PlateChips';
import { Pill } from '../ui/Pill';

/* Columnas en escritorio: % · objetivo · por lado · discos por lado · estado · flecha.
 * 64 + 112 + 112 + 1fr + 168 + 20, con 16 de separación. */
const COLUMNS = 'md:grid-cols-[64px_112px_112px_minmax(0,1fr)_168px_20px]';

/** Hasta esta diferencia, cargar lo más cercano es lo normal en un entrenamiento: no es un aviso. */
const SMALL_DIFFERENCE = kg(1);

/** La carga armable más cercana al objetivo. Si empatan, la de abajo: nunca pasarse del %. */
function nearest(row: StrengthRow): NearestLoad | null {
  if (row.load.status !== 'approximate') return null;
  const { below, above } = row.load;
  if (!below) return above;
  if (!above) return below;
  return Math.abs(above.difference) < Math.abs(below.difference) ? above : below;
}

function perSideText(row: StrengthRow): string | null {
  if (row.load.status === 'exact') return formatKg(row.load.perSide);
  const close = nearest(row);
  return close ? `≈ ${formatKg(close.perSide)}` : null;
}

function Plates({ row }: { row: StrengthRow }) {
  const { load } = row;
  if (load.status === 'exact') return <PlateChips combination={load.combinations[0] ?? []} />;
  const close = nearest(row);
  if (close) return <PlateChips combination={close.combination} />;
  return <p className="text-body text-muted">No alcanza el peso de la barra.</p>;
}

/** Para filas no exactas: qué se carga de verdad y cuánto se aleja del objetivo. */
function NearestNote({ row }: { row: StrengthRow }) {
  const close = nearest(row);
  if (!close) return null;
  const big = Math.abs(close.difference) > SMALL_DIFFERENCE;
  return (
    <span className={`num text-small ${big ? 'text-warning' : 'text-muted'}`}>
      Cargás {formatKg(close.total)} kg · {formatSignedLoad(close.difference)} kg del objetivo
    </span>
  );
}

function Status({ row }: { row: StrengthRow }) {
  const { load } = row;
  if (load.status === 'invalid') return <Pill tone="negative">Menor que la barra</Pill>;
  if (load.status === 'approximate') {
    const close = nearest(row);
    if (!close || Math.abs(close.difference) > SMALL_DIFFERENCE) {
      return <Pill tone="warning">Lejos del objetivo</Pill>;
    }
    return <span className="num text-small text-muted">La más cercana</span>;
  }
  const others = load.combinations.length - 1;
  return (
    <span className="num text-small text-muted">
      {others === 0
        ? 'Única'
        : `+${others}${load.truncated ? ' o más' : ''} ${others === 1 ? 'alternativa' : 'alternativas'}`}
    </span>
  );
}

interface Props {
  rows: StrengthRow[];
  stock: readonly PlateStock[];
}

/**
 * Tabla de Strength. En escritorio es una tabla de seis columnas; en el
 * celular cada fila pasa a dos líneas. Las filas que no se arman exactas
 * muestran la carga armable más cercana, con sus discos. Tocar una fila abre
 * la barra dibujada y sus alternativas.
 */
export function StrengthTable({ rows, stock }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div
        aria-hidden
        className={`hidden gap-4 px-4 pb-2 text-small text-muted md:grid ${COLUMNS}`}
      >
        <span>%</span>
        <span className="text-right">Objetivo</span>
        <span className="text-right">Por lado</span>
        <span>Discos por lado</span>
        <span className="text-right">Alternativas</span>
        <span />
      </div>
      <ul className="grid gap-1.5">
        {rows.map((row) => {
          const expanded = open === row.percent;
          const perSide = perSideText(row);
          return (
            <li key={row.percent} className="rounded-inner bg-surface">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : row.percent)}
                className="block w-full rounded-inner px-4 py-3 text-left"
              >
                {/* Celular: dos líneas, más la nota de la carga real si no es exacta */}
                <span className="grid gap-2 md:hidden">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="num text-section font-semibold">{formatPercent(row.percent)} %</span>
                    <span className="num text-section font-semibold">
                      {formatLoad(row.target)}
                      <span className="pl-1 text-body font-normal text-muted">kg</span>
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <Plates row={row} />
                    </span>
                    <span className="flex flex-none items-center gap-2">
                      {perSide === null ? (
                        <Status row={row} />
                      ) : (
                        <span className="num text-small text-muted">{perSide} por lado</span>
                      )}
                      <ChevronDown
                        size={20}
                        aria-hidden
                        className={`text-ink transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </span>
                  {row.load.status === 'approximate' && <NearestNote row={row} />}
                </span>

                {/* Escritorio: una línea en columnas */}
                <span className={`hidden items-center gap-4 md:grid ${COLUMNS}`}>
                  <span className="num text-section font-semibold">{formatPercent(row.percent)} %</span>
                  <span className="num text-right text-section font-semibold">
                    {formatLoad(row.target)}
                    <span className="pl-1 text-body font-normal text-muted">kg</span>
                  </span>
                  <span className="num text-right text-section">
                    {perSide === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <>
                        {perSide}
                        <span className="pl-1 text-body text-muted">kg</span>
                      </>
                    )}
                  </span>
                  <span className="grid min-w-0 gap-1">
                    <Plates row={row} />
                    {row.load.status === 'approximate' && <NearestNote row={row} />}
                  </span>
                  <span className="text-right">
                    <Status row={row} />
                  </span>
                  <ChevronDown
                    size={20}
                    aria-hidden
                    className={`text-ink transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
              {expanded && (
                <div className="px-4 pt-1 pb-4 md:max-w-[640px]">
                  <LoadDetail key={`${row.target}-${row.load.bar}`} result={row.load} stock={stock} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
